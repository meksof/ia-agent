import { Component, inject } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  template: `
    <div class="flex flex-col h-full bg-gray-900 text-white">
      <div class="p-4 border-b border-gray-700">
        <button 
          (click)="newConversation()"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + New Chat
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        @for (conv of conversationService.conversations(); track conv.id) {
          <div 
            class="group p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
            [class.bg-gray-800]="conversationService.activeConversation()?.id === conv.id"
            (click)="selectConversation(conv.id)"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium truncate flex-1">{{ conv.title }}</span>
              <button 
                class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                (click)="deleteConversation($event, conv.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-400 mt-1 truncate">{{ conv.model }}</div>
          </div>
        }
        
        @if (conversationService.conversations().length === 0) {
          <div class="p-4 text-gray-500 text-center text-sm">
            No conversations yet
          </div>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class SidebarComponent {
  conversationService = inject(ConversationService);

  newConversation(): void {
    const models = this.conversationService.models();
    const defaultModel = models.length > 0 ? models[0].name : 'llama2';
    this.conversationService.createConversation(defaultModel);
  }

  selectConversation(id: string): void {
    this.conversationService.selectConversation(id);
  }

  deleteConversation(event: Event, id: string): void {
    event.stopPropagation();
    this.conversationService.deleteConversation(id);
  }
}
