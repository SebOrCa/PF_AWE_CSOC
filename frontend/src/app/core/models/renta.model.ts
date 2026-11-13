export type EstadoRenta = 'pendiente' | 'confirmada' | 'entregada' | 'devuelta' | 'cancelada';

export interface Renta {
  id: string;
  usuarioId: string;
  disfrazId: string;
  talla: string;
  fechaInicio: string;
  fechaDevolucion: string;
  estado: EstadoRenta;
  total: number;
  creadaEn: number;
}
