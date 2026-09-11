import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'error', durationMs = 5000): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toasts.update(current => [...current, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
