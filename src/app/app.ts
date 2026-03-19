import { Component, inject } from '@angular/core';
import { ConversationService } from './services/conversation.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatComponent } from './components/chat/chat.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, ChatComponent, BottomNavComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar - Desktop -->
      <aside class="hidden md:block w-64 border-r bg-gray-900">
        <app-sidebar />
      </aside>
      
      <!-- Sidebar - Mobile -->
      <aside 
        class="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
        [class.hidden]="conversationService.mobileView() !== 'sidebar'"
        [class.opacity-0]="conversationService.mobileView() !== 'sidebar'"
        [class.pointer-events-none]="conversationService.mobileView() !== 'sidebar'"
        (click)="closeSidebar()"
      >
        <div 
          class="w-72 h-full bg-gray-900"
          (click)="$event.stopPropagation()"
        >
          <app-sidebar />
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto pb-16 md:pb-0">
          <app-chat />
        </div>
      </main>
      
      <!-- Bottom Navigation - Mobile -->
      <app-bottom-nav />
    </div>
  `,
  styles: ``
})
export class App {
  conversationService = inject(ConversationService);

  closeSidebar(): void {
    this.conversationService.setMobileView('chat');
  }
}
