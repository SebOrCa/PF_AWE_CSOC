import { Component, computed, input } from '@angular/core';

const PALETA = 6;

@Component({
  selector: 'app-costume-thumbnail',
  imports: [],
  templateUrl: './costume-thumbnail.html',
  styleUrl: './costume-thumbnail.css',
})
export class CostumeThumbnail {
  readonly nombre = input.required<string>();

  readonly iniciales = computed(() => {
    const palabras = this.nombre().trim().split(/\s+/).filter(Boolean);
    const letras = palabras.slice(0, 2).map((palabra) => palabra.charAt(0).toUpperCase());
    return letras.join('') || '?';
  });

  readonly colorIndex = computed(() => {
    const texto = this.nombre();
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = (hash * 31 + texto.charCodeAt(i)) % PALETA;
    }
    return hash;
  });
}
