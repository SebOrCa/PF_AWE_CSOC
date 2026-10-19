import { Service, signal } from '@angular/core';
import { EstadoRenta, Renta } from '../models/renta.model';

@Service()
export class RentaService {
  private readonly rentasSignal = signal<Renta[]>([
    {
      id: 'renta-1',
      usuarioId: 'u-cliente-demo',
      disfrazId: 'dis-bruja',
      talla: 'M',
      fechaInicio: '2026-10-20',
      fechaDevolucion: '2026-10-23',
      estado: 'confirmada',
      total: 510,
      creadaEn: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: 'renta-2',
      usuarioId: 'u-cliente-demo',
      disfrazId: 'dis-superheroe',
      talla: 'L',
      fechaInicio: '2026-09-01',
      fechaDevolucion: '2026-09-03',
      estado: 'devuelta',
      total: 610,
      creadaEn: Date.now() - 1000 * 60 * 60 * 24 * 40,
    },
  ]);

  readonly rentas = this.rentasSignal.asReadonly();

  rentasDeUsuario(usuarioId: string): Renta[] {
    return this.rentasSignal()
      .filter((r) => r.usuarioId === usuarioId)
      .sort((a, b) => b.creadaEn - a.creadaEn);
  }

  crearRenta(datos: Omit<Renta, 'id' | 'estado' | 'creadaEn'>): Renta {
    const nueva: Renta = {
      ...datos,
      id: 'renta-' + Date.now(),
      estado: 'pendiente',
      creadaEn: Date.now(),
    };
    this.rentasSignal.update((lista) => [nueva, ...lista]);
    return nueva;
  }

  cambiarEstado(id: string, estado: EstadoRenta): void {
    this.rentasSignal.update((lista) => lista.map((r) => (r.id === id ? { ...r, estado } : r)));
  }
}
