import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from './services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    console.error('Unhandled error', error);
    this.notifications.error('An unexpected error occurred. Please refresh the page.');
  }
}
