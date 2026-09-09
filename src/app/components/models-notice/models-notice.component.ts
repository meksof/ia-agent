import { Component, input, computed, inject } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-models-notice',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center h-full text-center">
      <div class="bg-yellow-100 rounded-full p-4 mb-4">
        @if (type() === 'loading') {
          <svg class="w-12 h-12 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        } @else {
          <svg class="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      </div>
      <h2 class="text-xl font-medium text-gray-700 mb-2">{{ title() }}</h2>
      <p class="text-gray-500 max-w-sm mb-4">{{ message() }}</p>
      
      @if (type() === 'not-installed') {
        <a href="https://ollama.com" target="_blank" 
           class="text-blue-600 hover:underline mb-4">
          Learn how to install Ollama
        </a>
      }
      
      @if (showRetry()) {
        <button (click)="retry()" 
                class="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Retry
        </button>
      }
    </div>
  `,
  styles: ``
})
export class ModelsNoticeComponent {
  type = input.required<'not-installed' | 'no-models' | 'error' | 'loading'>();
  
  private conversationService = inject(ConversationService);
  
  title = computed(() => {
    switch (this.type()) {
      case 'not-installed': return 'Ollama Not Detected';
      case 'no-models': return 'No Models Installed';
      case 'error': return 'Resource Not Found';
      case 'loading': return 'Loading Models';
    }
  });
  
  message = computed(() => {
    switch (this.type()) {
      case 'not-installed': return 'Ollama is not installed or not running. Please install Ollama and start it before continuing.';
      case 'no-models': return 'Ollama is running but no models are installed. Run `ollama pull llama2` in your terminal to get started.';
      case 'error': return `Check if the endpoint is correct.`;
      case 'loading': return 'Checking for available models...';
    }
  });
  
  showRetry = computed(() => this.type() !== 'loading');
  
  retry(): void {
    this.conversationService.loadModels();
  }
}
