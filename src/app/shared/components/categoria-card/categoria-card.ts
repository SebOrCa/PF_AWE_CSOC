import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-categoria-card',
  imports: [RouterLink],
  templateUrl: './categoria-card.html',
  styleUrl: './categoria-card.css',
})
export class CategoriaCard {
  readonly categoria = input.required<Categoria>();
  readonly cantidadDisfraces = input(0);
}
