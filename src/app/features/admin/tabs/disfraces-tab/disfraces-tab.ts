import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../../../core/services/catalogo';
import { Disfraz } from '../../../../core/models/disfraz.model';
import { CostumeThumbnail } from '../../../../shared/components/costume-thumbnail/costume-thumbnail';

interface FormularioDisfraz {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  tallas: string;
  precioPorDia: number;
  deposito: number;
  disponible: boolean;
}

const FORMULARIO_VACIO: FormularioDisfraz = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
  tallas: '',
  precioPorDia: 0,
  deposito: 0,
  disponible: true,
};

@Component({
  selector: 'app-disfraces-tab',
  imports: [FormsModule, CostumeThumbnail],
  templateUrl: './disfraces-tab.html',
  styleUrl: './disfraces-tab.css',
})
export class DisfracesTab {
  protected readonly catalogo = inject(Catalogo);

  readonly mostrarFormulario = signal(false);
  readonly disfrazEditandoId = signal<string | null>(null);
  readonly formulario = signal<FormularioDisfraz>({ ...FORMULARIO_VACIO });

  readonly tituloFormulario = computed(() => (this.disfrazEditandoId() ? 'Editar disfraz' : 'Agregar disfraz'));

  abrirAgregar(): void {
    this.disfrazEditandoId.set(null);
    this.formulario.set({ ...FORMULARIO_VACIO, categoriaId: this.catalogo.categorias()[0]?.id ?? '' });
    this.mostrarFormulario.set(true);
  }

  abrirEditar(disfraz: Disfraz): void {
    this.disfrazEditandoId.set(disfraz.id);
    this.formulario.set({
      nombre: disfraz.nombre,
      descripcion: disfraz.descripcion,
      categoriaId: disfraz.categoriaId,
      tallas: disfraz.tallas.join(', '),
      precioPorDia: disfraz.precioPorDia,
      deposito: disfraz.deposito,
      disponible: disfraz.disponible,
    });
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.disfrazEditandoId.set(null);
  }

  actualizarCampo<K extends keyof FormularioDisfraz>(campo: K, valor: FormularioDisfraz[K]): void {
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    const datos = this.formulario();
    if (!datos.nombre || !datos.categoriaId) return;

    const tallas = datos.tallas
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const editandoId = this.disfrazEditandoId();
    if (editandoId) {
      this.catalogo.actualizarDisfraz(editandoId, {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        categoriaId: datos.categoriaId,
        tallas,
        precioPorDia: datos.precioPorDia,
        deposito: datos.deposito,
        disponible: datos.disponible,
      });
    } else {
      this.catalogo.agregarDisfraz({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        categoriaId: datos.categoriaId,
        tallas,
        precioPorDia: datos.precioPorDia,
        deposito: datos.deposito,
        disponible: datos.disponible,
        fotos: [],
      });
    }

    this.cancelar();
  }

  alternarDisponibilidad(disfraz: Disfraz): void {
    this.catalogo.actualizarDisfraz(disfraz.id, { disponible: !disfraz.disponible });
  }
}
