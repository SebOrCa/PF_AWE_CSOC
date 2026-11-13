import { Service, computed, signal } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { Disfraz } from '../models/disfraz.model';

/**
 * Datos de catálogo simulados en memoria para poder maquetar el frontend
 * antes de que exista el backend. Cuando la API esté lista, estos signals
 * se llenarán desde HttpClient en lugar de los arreglos fijos de abajo.
 */
@Service()
export class Catalogo {
  private readonly categoriasSignal = signal<Categoria[]>([
    { id: 'cat-halloween', nombre: 'Halloween', descripcion: 'Disfraces clásicos de temporada de terror' },
    { id: 'cat-superheroes', nombre: 'Superhéroes', descripcion: 'Héroes y villanos de cómic' },
    { id: 'cat-epoca', nombre: 'Época', descripcion: 'Vestuario histórico y de época' },
    { id: 'cat-infantil', nombre: 'Infantil', descripcion: 'Disfraces para niñas y niños' },
    { id: 'cat-terror', nombre: 'Terror', descripcion: 'Disfraces de miedo para Halloween' },
    { id: 'cat-fantasia', nombre: 'Fantasía', descripcion: 'Criaturas y personajes fantásticos' },
  ]);

  private readonly disfracesSignal = signal<Disfraz[]>([
    {
      id: 'dis-dracula',
      nombre: 'Drácula Clásico',
      descripcion:
        'Elegante disfraz de Drácula con capa de terciopelo negro, camisa blanca con volantes y chaleco rojo. Ideal para Halloween y eventos de terror.',
      categoriaId: 'cat-halloween',
      tallas: ['S', 'M', 'L', 'XL'],
      precioPorDia: 150,
      deposito: 200,
      fotos: [],
      disponible: true,
      calificacion: 4.8,
      numeroResenas: 42,
    },
    {
      id: 'dis-bruja',
      nombre: 'Bruja Encantada',
      descripcion:
        'Disfraz de bruja con sombrero puntiagudo, vestido morado y accesorios incluidos. Perfecto para fiestas temáticas.',
      categoriaId: 'cat-halloween',
      tallas: ['XS', 'S', 'M', 'L'],
      precioPorDia: 120,
      deposito: 150,
      fotos: [],
      disponible: true,
      calificacion: 4.6,
      numeroResenas: 38,
    },
    {
      id: 'dis-superheroe',
      nombre: 'Superhéroe Galáctico',
      descripcion:
        'Traje de superhéroe con capa, musculatura integrada y detalles brillantes. Para los defensores más valientes.',
      categoriaId: 'cat-superheroes',
      tallas: ['S', 'M', 'L', 'XL'],
      precioPorDia: 180,
      deposito: 250,
      fotos: [],
      disponible: true,
      calificacion: 4.9,
      numeroResenas: 61,
    },
    {
      id: 'dis-reina',
      nombre: 'Reina Victoriana',
      descripcion: 'Vestido de época victoriana con corsé y crinolina. Incluye accesorios de gala.',
      categoriaId: 'cat-epoca',
      tallas: ['XS', 'S', 'M'],
      precioPorDia: 220,
      deposito: 300,
      fotos: [],
      disponible: false,
      calificacion: 4.7,
      numeroResenas: 27,
    },
    {
      id: 'dis-unicornio',
      nombre: 'Unicornio Mágico',
      descripcion: 'Disfraz infantil de unicornio con cuerno, crin de colores y alas brillantes.',
      categoriaId: 'cat-infantil',
      tallas: ['2-4', '4-6', '6-8', '8-10'],
      precioPorDia: 90,
      deposito: 100,
      fotos: [],
      disponible: true,
      calificacion: 5,
      numeroResenas: 89,
    },
    {
      id: 'dis-caballero',
      nombre: 'Caballero Medieval',
      descripcion: 'Armadura de caballero medieval con espada y escudo de utilería. Resistente y cómodo.',
      categoriaId: 'cat-epoca',
      tallas: ['S', 'M', 'L'],
      precioPorDia: 200,
      deposito: 250,
      fotos: [],
      disponible: true,
      calificacion: 4.5,
      numeroResenas: 15,
    },
  ]);

  readonly categorias = this.categoriasSignal.asReadonly();
  readonly disfraces = this.disfracesSignal.asReadonly();

  readonly disfracesDestacados = computed(() =>
    [...this.disfracesSignal()].sort((a, b) => b.calificacion - a.calificacion).slice(0, 4),
  );

  categoriaPorId(id: string): Categoria | undefined {
    return this.categoriasSignal().find((c) => c.id === id);
  }

  disfrazPorId(id: string): Disfraz | undefined {
    return this.disfracesSignal().find((d) => d.id === id);
  }

  disfracesPorCategoria(categoriaId: string): Disfraz[] {
    return this.disfracesSignal().filter((d) => d.categoriaId === categoriaId);
  }

  // --- Gestión de disfraces (panel de administrador) ---

  agregarDisfraz(disfraz: Omit<Disfraz, 'id' | 'calificacion' | 'numeroResenas'>): void {
    const nuevo: Disfraz = { ...disfraz, id: 'dis-' + Date.now(), calificacion: 0, numeroResenas: 0 };
    this.disfracesSignal.update((lista) => [...lista, nuevo]);
  }

  actualizarDisfraz(id: string, cambios: Partial<Disfraz>): void {
    this.disfracesSignal.update((lista) => lista.map((d) => (d.id === id ? { ...d, ...cambios } : d)));
  }

  eliminarDisfraz(id: string): void {
    this.disfracesSignal.update((lista) => lista.filter((d) => d.id !== id));
  }

  // --- Gestión de categorías (panel de administrador) ---

  agregarCategoria(categoria: Omit<Categoria, 'id'>): void {
    const nueva: Categoria = { ...categoria, id: 'cat-' + Date.now() };
    this.categoriasSignal.update((lista) => [...lista, nueva]);
  }

  actualizarCategoria(id: string, cambios: Partial<Categoria>): void {
    this.categoriasSignal.update((lista) => lista.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  eliminarCategoria(id: string): void {
    this.categoriasSignal.update((lista) => lista.filter((c) => c.id !== id));
  }
}
