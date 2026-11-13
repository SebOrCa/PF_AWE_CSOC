import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../config/api-config';
import { Auth } from '../services/auth';

/**
 * Agrega el JWT (`Authorization: Bearer ...`) a las peticiones hacia la API y, si el
 * backend responde 401 con una sesión iniciada (token vencido o usuario eliminado),
 * cierra la sesión y manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.token();

  if (!token || !req.url.startsWith(API_URL)) {
    return next(req);
  }

  const conToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(conToken).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.estaAutenticado()) {
        const rutaActual = router.url;
        auth.logout();
        router.navigate(['/login'], { queryParams: { redirectTo: rutaActual } });
      }
      return throwError(() => error);
    }),
  );
};
