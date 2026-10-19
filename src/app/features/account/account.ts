import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { PerfilTab } from './tabs/perfil-tab/perfil-tab';
import { RentasTab } from './tabs/rentas-tab/rentas-tab';

type TabCuenta = 'perfil' | 'rentas';

@Component({
  selector: 'app-account',
  imports: [PerfilTab, RentasTab],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  protected readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);

  readonly tabActiva = signal<TabCuenta>(
    this.route.snapshot.queryParamMap.get('tab') === 'rentas' ? 'rentas' : 'perfil',
  );

  cambiarTab(tab: TabCuenta): void {
    this.tabActiva.set(tab);
  }
}
