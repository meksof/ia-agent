import { Injectable, inject } from '@angular/core';
import { OllamaService } from './ollama.service';
import { Conversation, Message, OllamaModel } from '../models/chat.models';
import { firstValueFrom } from 'rxjs';
import { takeUntil, Subject } from 'rxjs';
import { ConversationStore } from './conversation.store';

@Injectable({
    providedIn: 'root'
})
export class ConversationService {
    private ollamaService = inject(OllamaService);
    private store = inject(ConversationStore);

    private cancelRequests$ = new Subject<void>();
    private userCancelled = false;

    get conversations() { return this.store.conversations; }
    get activeConversation() { return this.store.activeConversation; }
    get models() { return this.store.models; }
    get modelsStatus() { return this.store.modelsStatus; }
    get isLoading() { return this.store.isLoading; }
    get error() { return this.store.error; }
    get mobileView() { return this.store.mobileView; }

    constructor() {
        this.loadModels();
    }

    loadModels(): void {
        this.store.setModelsStatus('loading');
        this.ollamaService.getModels().subscribe({
            next: (response) => {
                this.store.setModels(response.models);
            },
            error: (err) => {
                if (err.status === 0) {
                    this.store.setModelsStatus('not-installed');
                } else {
                    this.store.setModelsStatus('error');
                }
            }
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
        this.store.addConversation(conversation);
        return conversation;
    }

    selectConversation(id: string): void {
        this.store.selectConversation(id);
    }

    deleteConversation(id: string): void {
        this.store.deleteConversation(id);
    }

    setModel(model: string): void {
        this.store.setModel(model);
    }

    setMobileView(view: 'chat' | 'sidebar'): void {
        this.store.setMobileView(view);
    }

    cancelCurrentRequest(): void {
        this.userCancelled = true;
        this.cancelRequests$.next();
    }

    async sendMessage(content: string): Promise<void> {
        const conv = this.store.activeConversation();
        if (!conv || !content.trim()) return;

        this.userCancelled = false;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        const next = this.addUserMessage(conv, userMessage);
        this.store.updateConversation(next);
        this.store.setLoading(conv.id, true);
        this.store.setError(null);

        try {
            const contextMessages = this.buildContext(next, userMessage);
            const response = await firstValueFrom(
                this.ollamaService.generate({
                    model: conv.model,
                    prompt: contextMessages,
                    stream: false
                }).pipe(takeUntil(this.cancelRequests$))
            );

            if (response) {
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date()
                };
                const final = this.addAssistantMessage(next, assistantMessage);
                this.store.updateConversation(final);
            }
        } catch (err) {
            if (this.userCancelled) {
                this.userCancelled = false;
                return;
            }
            if (this.store.activeConversation()?.id === conv.id) {
                this.store.setError('Failed to get a response from the model. Please check that Ollama is running and the model is available.');
            }
            console.error('Failed to get response:', err);
        } finally {
            this.store.setLoading(conv.id, false);
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
}