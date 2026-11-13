import { Component, computed, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Catalogo } from '../../../../core/services/catalogo';
import { RentaService } from '../../../../core/services/renta';
import { EstadoBadge } from '../../../../shared/components/estado-badge/estado-badge';
import { CostumeThumbnail } from '../../../../shared/components/costume-thumbnail/costume-thumbnail';

@Component({
  selector: 'app-rentas-tab',
  imports: [EstadoBadge, CostumeThumbnail],
  templateUrl: './rentas-tab.html',
  styleUrl: './rentas-tab.css',
})
export class RentasTab {
  private readonly auth = inject(Auth);
  private readonly rentaService = inject(RentaService);
  protected readonly catalogo = inject(Catalogo);

  readonly misRentas = computed(() => {
    const usuario = this.auth.usuarioActual();
    return usuario ? this.rentaService.rentasDeUsuario(usuario.id) : [];
  });
}
