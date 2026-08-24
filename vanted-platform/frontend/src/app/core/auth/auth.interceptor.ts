import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }, withCredentials: true })
    : req.clone({ withCredentials: true });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || req.url.includes('/api/auth/refresh') || req.url.includes('/api/auth/login')) {
        return throwError(() => error);
      }
      return auth.refresh().pipe(
        switchMap(response => next(req.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` }, withCredentials: true }))),
        catchError(refreshError => {
          auth.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
