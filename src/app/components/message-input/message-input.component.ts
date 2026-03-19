import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  template: `
    <div class="flex gap-2 mt-3">
      <input
        type="text"
        [ngModel]="message()"
        (ngModelChange)="message.set($event)"
        (keydown.enter)="sendMessage()"
        [disabled]="conversationService.isLoading() || !conversation()"
        placeholder="Type your message..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        (click)="sendMessage()"
        [disabled]="!message().trim() || conversationService.isLoading() || !conversation()"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        @if (conversationService.isLoading()) {
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        } @else {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        }
      </button>
    </div>
  `,
  styles: ``
})
export class MessageInputComponent {
  conversationService = inject(ConversationService);
  conversation = this.conversationService.activeConversation;
  message = signal('');

  sendMessage(): void {
    if (this.message().trim() && !this.conversationService.isLoading()) {
      this.conversationService.sendMessage(this.message());
      this.message.set('');
    }
  }
}
