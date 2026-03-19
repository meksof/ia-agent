import { Injectable, inject, signal, computed } from '@angular/core';
import { OllamaService } from './ollama.service';
import { Conversation, Message, OllamaModel } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private ollamaService = inject(OllamaService);
  
  private conversationsSignal = signal<Conversation[]>([]);
  private activeConversationIdSignal = signal<string | null>(null);
  private modelsSignal = signal<OllamaModel[]>([]);
  private isLoadingSignal = signal(false);
  private mobileViewSignal = signal<'chat' | 'sidebar'>('chat');

  conversations = computed(() => this.conversationsSignal());
  activeConversation = computed(() => {
    const id = this.activeConversationIdSignal();
    return this.conversationsSignal().find(c => c.id === id) ?? null;
  });
  models = computed(() => this.modelsSignal());
  isLoading = computed(() => this.isLoadingSignal());
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
        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
      this.conversationsSignal.set(conversations);
      if (conversations.length > 0) {
        this.activeConversationIdSignal.set(conversations[0].id);
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
    this.activeConversationIdSignal.set(conversation.id);
    this.saveToStorage();
    return conversation;
  }

  selectConversation(id: string): void {
    this.activeConversationIdSignal.set(id);
    this.setMobileView('chat');
  }

  deleteConversation(id: string): void {
    this.conversationsSignal.update(convs => convs.filter(c => c.id !== id));
    if (this.activeConversationIdSignal() === id) {
      const remaining = this.conversationsSignal();
      this.activeConversationIdSignal.set(remaining.length > 0 ? remaining[0].id : null);
    }
    this.saveToStorage();
  }

  setModel(model: string): void {
    const convId = this.activeConversationIdSignal();
    if (convId) {
      this.conversationsSignal.update(convs => 
        convs.map(c => c.id === convId ? { ...c, model } : c)
      );
      this.saveToStorage();
    }
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

    this.conversationsSignal.update(convs => 
      convs.map(c => c.id === conv.id ? {
        ...c,
        messages: [...c.messages, userMessage],
        updatedAt: new Date(),
        title: c.messages.length === 0 ? this.generateTitle(content) : c.title
      } : c)
    );

    this.saveToStorage();
    this.isLoadingSignal.set(true);

    try {
      const contextMessages = this.buildContext(conv.id, userMessage);
      const response = await this.ollamaService.generate({
        model: conv.model,
        prompt: contextMessages,
        stream: false
      }).toPromise();

      if (response) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };

        this.conversationsSignal.update(convs => 
          convs.map(c => c.id === conv.id ? {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date()
          } : c)
        );
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  private buildContext(conversationId: string, currentMessage: Message): string {
    const conv = this.conversationsSignal().find(c => c.id === conversationId);
    if (!conv) return currentMessage.content;

    let context = '';
    for (const msg of conv.messages) {
      context += `${msg.role}: ${msg.content}\n`;
    }
    context += `user: ${currentMessage.content}`;
    return context;
  }

  private generateTitle(firstMessage: string): string {
    const words = firstMessage.trim().split(/\s+/);
    if (words.length <= 5) return firstMessage.trim();
    return words.slice(0, 5).join(' ') + '...';
  }

  setMobileView(view: 'chat' | 'sidebar'): void {
    this.mobileViewSignal.set(view);
  }
}
