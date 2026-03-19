import { Component, inject } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div class="flex justify-around">
        <button
          (click)="setView('chat')"
          class="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"
          [class.text-blue-600]="conversationService.mobileView() === 'chat'"
          [class.text-gray-500]="conversationService.mobileView() !== 'chat'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-xs">Chat</span>
        </button>
        <button
          (click)="setView('sidebar')"
          class="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"
          [class.text-blue-600]="conversationService.mobileView() === 'sidebar'"
          [class.text-gray-500]="conversationService.mobileView() !== 'sidebar'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="text-xs">History</span>
        </button>
      </div>
    </nav>
  `,
  styles: ``
})
export class BottomNavComponent {
  conversationService = inject(ConversationService);

  setView(view: 'chat' | 'sidebar'): void {
    this.conversationService.setMobileView(view);
  }
}
