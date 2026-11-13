export type RolUsuario = 'cliente' | 'administrador';

/** Debe coincidir con MIN_PASSWORD_LENGTH del backend. */
export const LONGITUD_MINIMA_CONTRASENA = 6;

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: RolUsuario;
  clienteDesde?: number;
}
