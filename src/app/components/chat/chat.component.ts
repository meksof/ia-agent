import { Component, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ModelSelectorComponent } from '../model-selector/model-selector.component';

@Component({
  selector: 'app-chat',
  imports: [MessageInputComponent, ModelSelectorComponent],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between p-4 border-b bg-white">
        <h1 class="text-lg font-semibold text-gray-800">IA Agent</h1>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" #chatContainer>
        @if (conversationService.activeConversation()) {
          @if (conversationService.activeConversation()!.messages.length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center">
              <div class="bg-blue-100 rounded-full p-4 mb-4">
                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 class="text-xl font-medium text-gray-700 mb-2">Start a conversation</h2>
              <p class="text-gray-500 max-w-sm">
                Select a model below and send your first message to begin chatting with the AI.
              </p>
            </div>
          } @else {
            @for (message of conversationService.activeConversation()!.messages; track message.id) {
              <div 
                class="flex"
                [class.justify-end]="message.role === 'user'"
                [class.justify-start]="message.role === 'assistant'"
              >
                <div 
                  class="max-w-[80%] rounded-lg p-3"
                  [class.bg-blue-600]="message.role === 'user'"
                  [class.text-white]="message.role === 'user'"
                  [class.bg-gray-200]="message.role === 'assistant'"
                  [class.text-gray-800]="message.role === 'assistant'"
                >
                  <p class="whitespace-pre-wrap">{{ message.content }}</p>
                </div>
              </div>
            }
          }
          
          @if (conversationService.isLoading()) {
            <div id="spinner" class="flex justify-start">
              <div class="bg-gray-200 rounded-lg p-3 text-gray-800">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          }
        } @else {
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="bg-blue-100 rounded-full p-4 mb-4">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-xl font-medium text-gray-700 mb-2">Welcome to IA Agent</h2>
            <p class="text-gray-500 max-w-sm mb-6">
              Create a new conversation to start chatting with local AI models via Ollama.
            </p>
            <button 
              (click)="createConversation()"
              class="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start New Chat
            </button>
          </div>
        }
      </div>
      
      @if (conversationService.activeConversation()) {
        <div class="p-4 border-t bg-white">
          <app-model-selector 
            [selectedModel]="conversationService.activeConversation()!.model"
            [disabled]="conversationService.activeConversation()!.messages.length > 0"
          />
          <app-message-input />
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  conversationService = inject(ConversationService);

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  createConversation(): void {
    const models = this.conversationService.models();
    const defaultModel = models.length > 0 ? models[0].name : 'llama2';
    this.conversationService.createConversation(defaultModel);
  }
}
