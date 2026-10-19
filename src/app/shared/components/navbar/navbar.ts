import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  protected readonly auth = inject(Auth);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  inicialUsuario(): string {
    return this.auth.usuarioActual()?.nombre.charAt(0).toUpperCase() ?? '';
  }
}
