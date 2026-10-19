import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../../../core/services/catalogo';
import { Categoria } from '../../../../core/models/categoria.model';

interface FormularioCategoria {
  nombre: string;
  descripcion: string;
}

const FORMULARIO_VACIO: FormularioCategoria = { nombre: '', descripcion: '' };

@Component({
  selector: 'app-categorias-tab',
  imports: [FormsModule],
  templateUrl: './categorias-tab.html',
  styleUrl: './categorias-tab.css',
})
export class CategoriasTab {
  protected readonly catalogo = inject(Catalogo);

  readonly mostrarFormulario = signal(false);
  readonly categoriaEditandoId = signal<string | null>(null);
  readonly formulario = signal<FormularioCategoria>({ ...FORMULARIO_VACIO });

  readonly tituloFormulario = computed(() =>
    this.categoriaEditandoId() ? 'Editar categoría' : 'Agregar categoría',
  );

  abrirAgregar(): void {
    this.categoriaEditandoId.set(null);
    this.formulario.set({ ...FORMULARIO_VACIO });
    this.mostrarFormulario.set(true);
  }

  abrirEditar(categoria: Categoria): void {
    this.categoriaEditandoId.set(categoria.id);
    this.formulario.set({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    });
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.categoriaEditandoId.set(null);
  }

  actualizarCampo<K extends keyof FormularioCategoria>(campo: K, valor: FormularioCategoria[K]): void {
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    const datos = this.formulario();
    if (!datos.nombre) return;

    const editandoId = this.categoriaEditandoId();
    if (editandoId) {
      this.catalogo.actualizarCategoria(editandoId, datos);
    } else {
      this.catalogo.agregarCategoria(datos);
    }

    this.cancelar();
  }

  eliminar(categoria: Categoria): void {
    this.catalogo.eliminarCategoria(categoria.id);
  }
}
