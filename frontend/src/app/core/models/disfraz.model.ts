export interface Disfraz {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  tallas: string[];
  precioPorDia: number;
  deposito: number;
  fotos: string[];
  disponible: boolean;
  calificacion: number;
  numeroResenas: number;
}
