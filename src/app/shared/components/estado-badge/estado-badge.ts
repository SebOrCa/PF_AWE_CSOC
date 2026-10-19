import { Component, computed, input } from '@angular/core';
import { EstadoRenta } from '../../../core/models/renta.model';

const ETIQUETAS: Record<EstadoRenta, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  entregada: 'Entregada',
  devuelta: 'Devuelta',
  cancelada: 'Cancelada',
};

@Component({
  selector: 'app-estado-badge',
  imports: [],
  templateUrl: './estado-badge.html',
  styleUrl: './estado-badge.css',
})
export class EstadoBadge {
  readonly estado = input.required<EstadoRenta>();
  readonly etiqueta = computed(() => ETIQUETAS[this.estado()]);
}
