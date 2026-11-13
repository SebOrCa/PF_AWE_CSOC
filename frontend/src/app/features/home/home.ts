import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Catalogo } from '../../core/services/catalogo';
import { CategoriaCard } from '../../shared/components/categoria-card/categoria-card';
import { DisfrazCard } from '../../shared/components/disfraz-card/disfraz-card';
import { CostumeThumbnail } from '../../shared/components/costume-thumbnail/costume-thumbnail';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoriaCard, DisfrazCard, CostumeThumbnail],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly catalogo = inject(Catalogo);
}
