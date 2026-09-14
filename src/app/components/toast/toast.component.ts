import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      aria-live="assertive"
      aria-atomic="false"
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="flex items-start gap-3 min-w-72 max-w-sm rounded-lg px-4 py-3 shadow-lg pointer-events-auto transition-all duration-300"
          [class]="toastClasses(toast)"
        >
          <span class="mt-0.5 shrink-0">
            @switch (toast.type) {
              @case ('error') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              }
              @case ('success') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @default {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
              }
            }
          </span>
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            type="button"
            class="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            [attr.aria-label]="'Dismiss notification'"
            (click)="toastService.dismiss(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  toastClasses(toast: Toast): string {
    const base = 'flex items-start gap-3 min-w-72 max-w-sm rounded-lg px-4 py-3 shadow-lg pointer-events-auto transition-all duration-300';
    switch (toast.type) {
      case 'error':   return `${base} bg-red-600 text-white`;
      case 'warning': return `${base} bg-yellow-500 text-white`;
      case 'success': return `${base} bg-green-600 text-white`;
      case 'info':    return `${base} bg-blue-600 text-white`;
      default:        return `${base} bg-gray-800 text-white`;
    }
  }
}
