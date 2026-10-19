export type RolUsuario = 'cliente' | 'administrador';

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: RolUsuario;
  clienteDesde?: number;
}
