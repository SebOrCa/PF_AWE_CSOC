import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';

/**
 * Widget de demostración (no forma parte del producto final): permite
 * cambiar entre Visitante / Cliente / Admin sin backend para poder
 * revisar las vistas protegidas mientras no existe autenticación real.
 */
@Component({
  selector: 'app-role-switcher',
  imports: [],
  templateUrl: './role-switcher.html',
  styleUrl: './role-switcher.css',
})
export class RoleSwitcher {
  protected readonly auth = inject(Auth);
}
