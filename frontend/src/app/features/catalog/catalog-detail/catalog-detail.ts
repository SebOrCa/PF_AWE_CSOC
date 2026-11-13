import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Catalogo } from '../../../core/services/catalogo';
import { CostumeThumbnail } from '../../../shared/components/costume-thumbnail/costume-thumbnail';

@Component({
  selector: 'app-catalog-detail',
  imports: [RouterLink, CostumeThumbnail],
  templateUrl: './catalog-detail.html',
  styleUrl: './catalog-detail.css',
})
export class CatalogDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly catalogo = inject(Catalogo);
  protected readonly auth = inject(Auth);

  private readonly disfrazId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly disfraz = computed(() => this.catalogo.disfrazPorId(this.disfrazId()));
  readonly categoria = computed(() => {
    const disfraz = this.disfraz();
    return disfraz ? this.catalogo.categoriaPorId(disfraz.categoriaId) : undefined;
  });

  readonly tallaSeleccionada = signal<string | null>(null);

  seleccionarTalla(talla: string): void {
    this.tallaSeleccionada.set(talla);
  }

  irAApartar(): void {
    const disfraz = this.disfraz();
    if (!disfraz) return;

    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: `/catalogo/${disfraz.id}/apartar` } });
      return;
    }

    this.router.navigate(['/catalogo', disfraz.id, 'apartar'], {
      queryParams: { talla: this.tallaSeleccionada() ?? disfraz.tallas[0] },
    });
  }
}
