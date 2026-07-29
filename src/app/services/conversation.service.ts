import { Injectable, inject, signal, computed } from '@angular/core';
import { OllamaService } from './ollama.service';
import { Conversation, Message, OllamaModel } from '../models/chat.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConversationService {
    private ollamaService = inject(OllamaService);

    private conversationsSignal = signal<Conversation[]>([]);
    private modelsSignal = signal<OllamaModel[]>([]);
    private isLoadingMapSignal = signal<Map<string, boolean>>(new Map());
    private errorSignal = signal<string | null>(null);
    private mobileViewSignal = signal<'chat' | 'sidebar'>('chat');

    conversations = computed(() => this.conversationsSignal());
    activeConversation = signal<Conversation | null>(null);
    models = computed(() => this.modelsSignal());
    isLoading = computed(() => {
        const conv = this.activeConversation();
        if (!conv) return false;
        return this.isLoadingMapSignal().get(conv.id) ?? false;
    });
    error = computed(() => this.errorSignal());
    mobileView = computed(() => this.mobileViewSignal());

    constructor() {
        this.loadFromStorage();
        this.loadModels();
    }

    private loadFromStorage(): void {
        const stored = localStorage.getItem('conversations');
        if (stored) {
            const conversations = JSON.parse(stored).map((c: any) => ({
                ...c,
                createdAt: new Date(c.createdAt),
                updatedAt: new Date(c.updatedAt),
                messages: c.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }))
            }));
            this.conversationsSignal.set(conversations);
            if (conversations.length > 0) {
                this.activeConversation.set(conversations[0]);
            }
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('conversations', JSON.stringify(this.conversationsSignal()));
    }

    loadModels(): void {
        this.ollamaService.getModels().subscribe({
            next: (response) => {
                this.modelsSignal.set(response.models);
            },
            error: (err) => console.error('Failed to load models:', err)
        });
    }

    createConversation(model: string): Conversation {
        const conversation: Conversation = {
            id: crypto.randomUUID(),
            title: 'New conversation',
            model,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.conversationsSignal.update(convs => [conversation, ...convs]);
        this.activeConversation.set(conversation);
        this.saveToStorage();
        return conversation;
    }

    selectConversation(id: string): void {
        this.errorSignal.set(null);
        const conv = this.conversationsSignal().find(c => c.id === id);
        if (!conv) return;
        this.activeConversation.set(conv);
        this.setMobileView('chat');
    }

    deleteConversation(id: string): void {
        this.conversationsSignal.update(convs => {
            const filtered = convs.filter(c => c.id !== id);
            if (this.activeConversation()?.id === id) {
                this.activeConversation.set(filtered.length > 0 ? filtered[0] : null);
            }
            return filtered;
        });
        this.saveToStorage();
    }

    setModel(model: string): void {
        const conv = this.activeConversation();
        if (!conv) return;
        const updated = { ...conv, model };
        this.updateConversationsAndActive(updated);
        this.saveToStorage();
    }

    async sendMessage(content: string): Promise<void> {
        const conv = this.activeConversation();
        if (!conv || !content.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        const updatedConv = this.addUserMessage(conv, userMessage);
        this.updateConversationsAndActive(updatedConv);
        this.saveToStorage();
        this.setLoading(conv.id, true);
        this.errorSignal.set(null);

        try {
            const contextMessages = this.buildContext(updatedConv, userMessage);
            const response = await firstValueFrom(
                this.ollamaService.generate({
                    model: conv.model,
                    prompt: contextMessages,
                    stream: false
                })
            );

            if (response) {
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date()
                };
                const finalConv = this.addAssistantMessage(updatedConv, assistantMessage);
                this.updateConversationsAndActive(finalConv);
                this.saveToStorage();
            }
        } catch (err) {
            if (this.activeConversation()?.id === conv.id) {
                this.errorSignal.set('Failed to get a response from the model. Please check that Ollama is running and the model is available.');
            }
            console.error('Failed to get response:', err);
        } finally {
            this.setLoading(conv.id, false);
        }
    }

    private addUserMessage(conv: Conversation, message: Message): Conversation {
        return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date(),
            title: conv.messages.length === 0 ? this.generateTitle(message.content) : conv.title
        };
    }

    private addAssistantMessage(conv: Conversation, message: Message): Conversation {
        return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date()
        };
    }

    private updateConversationsAndActive(updatedConv: Conversation): void {
        this.conversationsSignal.update(convs =>
            convs.map(c => c.id === updatedConv.id ? updatedConv : c)
        );
        this.activeConversation.set(updatedConv);
    }

    private setLoading(convId: string, loading: boolean): void {
        this.isLoadingMapSignal.update(map => {
            const newMap = new Map(map);
            newMap.set(convId, loading);
            return newMap;
        });
    }

    private buildContext(conv: Conversation, currentMessage: Message): string {
        let context = '';
        for (const msg of conv.messages) {
            context += `${msg.role}: ${msg.content}\n`;
        }
        context += `user: ${currentMessage.content}`;
        return context;
    }

    private generateTitle(firstMessage: string): string {
        const cleaned = firstMessage.trim().replace(/[^\w\s]/g, '');
        const words = cleaned.split(/\s+/).filter(Boolean);
        if (words.length <= 5) return cleaned;
        return words.slice(0, 5).join(' ') + '...';
    }

    setMobileView(view: 'chat' | 'sidebar'): void {
        this.mobileViewSignal.set(view);
    }
}