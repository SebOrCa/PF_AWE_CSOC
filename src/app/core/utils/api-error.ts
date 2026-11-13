import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte cualquier error de una llamada a la API en un mensaje para el usuario.
 * El backend responde los errores como `{ ok: false, msg: '...' }`.
 */
export function mensajeDeError(
  error: unknown,
  porDefecto = 'Ocurrió un error inesperado. Intenta de nuevo.',
): string {
  if (error instanceof HttpErrorResponse) {
    // 0: sin red. 502/503/504: el proxy (nginx) no logró hablar con el backend.
    if (error.status === 0 || [502, 503, 504].includes(error.status)) {
      return 'No se pudo conectar con el servidor. Intenta más tarde.';
    }

    const msg = error.error?.msg;
    if (typeof msg === 'string' && msg) {
      return msg;
    }
  }

  return porDefecto;
}
