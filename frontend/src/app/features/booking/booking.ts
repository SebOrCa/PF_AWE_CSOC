import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Catalogo } from '../../core/services/catalogo';
import { RentaService } from '../../core/services/renta';
import { CostumeThumbnail } from '../../shared/components/costume-thumbnail/costume-thumbnail';

@Component({
  selector: 'app-booking',
  imports: [FormsModule, RouterLink, CostumeThumbnail],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rentaService = inject(RentaService);
  protected readonly catalogo = inject(Catalogo);
  protected readonly auth = inject(Auth);

  private readonly disfrazId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly disfraz = computed(() => this.catalogo.disfrazPorId(this.disfrazId()));

  readonly talla = signal(this.route.snapshot.queryParamMap.get('talla') ?? '');

  private readonly hoy = new Date();
  private readonly enTresDias = new Date(this.hoy.getTime() + 1000 * 60 * 60 * 24 * 3);

  readonly fechaInicio = signal(this.formatearFecha(this.hoy));
  readonly fechaDevolucion = signal(this.formatearFecha(this.enTresDias));

  readonly duracionDias = computed(() => {
    const inicio = new Date(this.fechaInicio());
    const devolucion = new Date(this.fechaDevolucion());
    const diff = Math.round((devolucion.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  });

  readonly subtotal = computed(() => (this.disfraz()?.precioPorDia ?? 0) * this.duracionDias());
  readonly deposito = computed(() => this.disfraz()?.deposito ?? 0);
  readonly total = computed(() => this.subtotal() + this.deposito());

  readonly confirmado = signal(false);

  confirmarApartado(): void {
    const disfraz = this.disfraz();
    const usuario = this.auth.usuarioActual();
    if (!disfraz || !usuario || this.duracionDias() <= 0) return;

    this.rentaService.crearRenta({
      usuarioId: usuario.id,
      disfrazId: disfraz.id,
      talla: this.talla() || disfraz.tallas[0],
      fechaInicio: this.fechaInicio(),
      fechaDevolucion: this.fechaDevolucion(),
      total: this.total(),
    });

    this.confirmado.set(true);
    setTimeout(() => this.router.navigate(['/mi-cuenta'], { queryParams: { tab: 'rentas' } }), 1200);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }
}
