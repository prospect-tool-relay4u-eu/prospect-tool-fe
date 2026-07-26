import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { NotificationService } from '../services/notification.service';

const REQUEST_TIMEOUT_MS = 15000;

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const errorService = inject(ErrorService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((err: unknown) => {
      if (err instanceof TimeoutError) {
        const timeoutError = new HttpErrorResponse({
          status: 0,
          url: req.url,
          error: { code: 'TIMEOUT' },
        });
        notifications.error(errorService.messageFor(errorService.parse(timeoutError)));
        return throwError(() => timeoutError);
      }

      const httpError = err as HttpErrorResponse;

      if (httpError.status === 401 && !req.url.includes('/api/auth/')) {
        auth.logout();
      }

      const apiError = errorService.parse(httpError);
      if (apiError.category === 'network' || apiError.category === 'server' || httpError.status === 429) {
        notifications.error(errorService.messageFor(apiError));
      }

      return throwError(() => httpError);
    })
  );
};
