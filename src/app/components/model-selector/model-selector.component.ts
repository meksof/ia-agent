import { Component, inject, input } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-model-selector',
  imports: [],
  template: `
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-600">Model:</label>
      <select
        [value]="selectedModel()"
        (change)="onModelChange($event)"
        [disabled]="disabled()"
        class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        @for (model of conversationService.models(); track model.name) {
          <option [value]="model.name">{{ model.name }}</option>
        }
      </select>
      @if (disabled()) {
        <span class="text-xs text-gray-400">(locked after first message)</span>
      }
    </div>
  `,
  styles: ``
})
export class ModelSelectorComponent {
  selectedModel = input<string>('');
  disabled = input<boolean>(false);
  
  conversationService = inject(ConversationService);

  onModelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.conversationService.setModel(select.value);
  }
}
