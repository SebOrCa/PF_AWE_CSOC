import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Disfraz } from '../../../core/models/disfraz.model';
import { CostumeThumbnail } from '../costume-thumbnail/costume-thumbnail';

@Component({
  selector: 'app-disfraz-card',
  imports: [RouterLink, CostumeThumbnail],
  templateUrl: './disfraz-card.html',
  styleUrl: './disfraz-card.css',
})
export class DisfrazCard {
  readonly disfraz = input.required<Disfraz>();
  readonly nombreCategoria = input<string>('');
}
