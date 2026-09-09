import { Injectable, inject, signal, computed } from '@angular/core';
import { Conversation, Message, OllamaModel, ModelsStatus } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ConversationStore {
    private conversationsSignal = signal<Conversation[]>([]);
    private modelsSignal = signal<OllamaModel[]>([]);
    private modelsStatusSignal = signal<ModelsStatus>('idle');
    private isLoadingMapSignal = signal<Map<string, boolean>>(new Map());
    private errorSignal = signal<string | null>(null);
    private mobileViewSignal = signal<'chat' | 'sidebar'>('chat');

    conversations = computed(() => this.conversationsSignal());
    activeConversation = signal<Conversation | null>(null);
    models = computed(() => this.modelsSignal());
    modelsStatus = computed(() => this.modelsStatusSignal());
    isLoading = computed(() => {
        const conv = this.activeConversation();
        if (!conv) return false;
        return this.isLoadingMapSignal().get(conv.id) ?? false;
    });
    error = computed(() => this.errorSignal());
    mobileView = computed(() => this.mobileViewSignal());

    constructor() {
        this.loadFromStorage();
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

    setModels(models: OllamaModel[]): void {
        this.modelsSignal.set(models);
        this.modelsStatusSignal.set(models.length > 0 ? 'loaded' : 'no-models');
    }

    setModelsStatus(status: ModelsStatus): void {
        this.modelsStatusSignal.set(status);
    }

    addConversation(conv: Conversation): void {
        this.conversationsSignal.update(convs => [conv, ...convs]);
        this.activeConversation.set(conv);
        this.saveToStorage();
    }

    selectConversation(id: string): boolean {
        const conv = this.conversationsSignal().find(c => c.id === id);
        if (!conv) return false;
        this.errorSignal.set(null);
        this.activeConversation.set(conv);
        this.mobileViewSignal.set('chat');
        return true;
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
        this.updateConversation({ ...conv, model });
    }

    updateConversation(updated: Conversation): void {
        this.conversationsSignal.update(convs =>
            convs.map(c => c.id === updated.id ? updated : c)
        );
        this.activeConversation.set(updated);
        this.saveToStorage();
    }

    setLoading(convId: string, loading: boolean): void {
        this.isLoadingMapSignal.update(map => {
            const next = new Map(map);
            next.set(convId, loading);
            return next;
        });
    }

    setError(message: string | null): void {
        this.errorSignal.set(message);
    }

    setMobileView(view: 'chat' | 'sidebar'): void {
        this.mobileViewSignal.set(view);
    }
}