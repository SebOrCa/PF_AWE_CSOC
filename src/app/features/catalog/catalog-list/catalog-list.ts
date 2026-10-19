import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Catalogo } from '../../../core/services/catalogo';
import { DisfrazCard } from '../../../shared/components/disfraz-card/disfraz-card';

@Component({
  selector: 'app-catalog-list',
  imports: [FormsModule, DisfrazCard],
  templateUrl: './catalog-list.html',
  styleUrl: './catalog-list.css',
})
export class CatalogList {
  protected readonly catalogo = inject(Catalogo);
  private readonly route = inject(ActivatedRoute);

  readonly busqueda = signal('');
  readonly categoriaSeleccionada = signal<string | null>(
    this.route.snapshot.queryParamMap.get('categoria'),
  );

  readonly disfracesFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaSeleccionada();

    return this.catalogo.disfraces().filter((disfraz) => {
      const coincideCategoria = !categoria || disfraz.categoriaId === categoria;
      const coincideTexto = !texto || disfraz.nombre.toLowerCase().includes(texto);
      return coincideCategoria && coincideTexto;
    });
  });

  seleccionarCategoria(categoriaId: string | null): void {
    this.categoriaSeleccionada.set(categoriaId);
  }
}
