import { Component, computed, inject, signal } from '@angular/core';
import { Catalogo } from '../../../core/services/catalogo';
import { RentaService } from '../../../core/services/renta';
import { CategoriasTab } from '../tabs/categorias-tab/categorias-tab';
import { DisfracesTab } from '../tabs/disfraces-tab/disfraces-tab';
import { RentasTab } from '../tabs/rentas-tab/rentas-tab';

type TabAdmin = 'disfraces' | 'categorias' | 'rentas';

@Component({
  selector: 'app-admin-panel',
  imports: [DisfracesTab, CategoriasTab, RentasTab],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel {
  protected readonly catalogo = inject(Catalogo);
  private readonly rentaService = inject(RentaService);

  readonly tabActiva = signal<TabAdmin>('disfraces');

  readonly disfracesActivos = computed(
    () => this.catalogo.disfraces().filter((d) => d.disponible).length,
  );
  readonly totalCategorias = computed(() => this.catalogo.categorias().length);

  readonly rentasEsteMes = computed(() => {
    const ahora = new Date();
    return this.rentaService
      .rentas()
      .filter((r) => {
        const fecha = new Date(r.creadaEn);
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }).length;
  });

  readonly ingresosDelMes = computed(() =>
    this.rentaService
      .rentas()
      .filter((r) => r.estado !== 'cancelada')
      .reduce((suma, r) => suma + r.total, 0),
  );

  cambiarTab(tab: TabAdmin): void {
    this.tabActiva.set(tab);
  }
}
