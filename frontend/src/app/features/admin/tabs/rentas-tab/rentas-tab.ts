import { Component, inject } from '@angular/core';
import { Catalogo } from '../../../../core/services/catalogo';
import { RentaService } from '../../../../core/services/renta';
import { Renta, EstadoRenta } from '../../../../core/models/renta.model';
import { EstadoBadge } from '../../../../shared/components/estado-badge/estado-badge';
import { CostumeThumbnail } from '../../../../shared/components/costume-thumbnail/costume-thumbnail';

const SIGUIENTE_ESTADO: Partial<Record<EstadoRenta, EstadoRenta>> = {
  pendiente: 'confirmada',
  confirmada: 'entregada',
  entregada: 'devuelta',
};

const ETIQUETA_ACCION: Partial<Record<EstadoRenta, string>> = {
  pendiente: 'Confirmar',
  confirmada: 'Marcar entregada',
  entregada: 'Marcar devuelta',
};

@Component({
  selector: 'app-rentas-tab',
  imports: [EstadoBadge, CostumeThumbnail],
  templateUrl: './rentas-tab.html',
  styleUrl: './rentas-tab.css',
})
export class RentasTab {
  protected readonly catalogo = inject(Catalogo);
  protected readonly rentaService = inject(RentaService);

  siguienteEstado(renta: Renta): EstadoRenta | undefined {
    return SIGUIENTE_ESTADO[renta.estado];
  }

  etiquetaAccion(renta: Renta): string | undefined {
    return ETIQUETA_ACCION[renta.estado];
  }

  avanzarEstado(renta: Renta): void {
    const siguiente = this.siguienteEstado(renta);
    if (siguiente) {
      this.rentaService.cambiarEstado(renta.id, siguiente);
    }
  }

  cancelar(renta: Renta): void {
    this.rentaService.cambiarEstado(renta.id, 'cancelada');
  }

  puedeCancelar(renta: Renta): boolean {
    return renta.estado === 'pendiente' || renta.estado === 'confirmada';
  }
}
