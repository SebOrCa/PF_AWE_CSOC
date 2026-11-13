import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly correo = signal('');
  readonly contrasena = signal('');
  readonly error = signal('');
  readonly cargando = signal(false);

  async iniciarSesion(): Promise<void> {
    if (!this.correo() || !this.contrasena()) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.error.set('');
    this.cargando.set(true);

    try {
      await this.auth.login(this.correo(), this.contrasena());
      this.redirigirDespuesDeLogin();
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  private redirigirDespuesDeLogin(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    this.router.navigateByUrl(redirectTo ?? (this.auth.esAdmin() ? '/admin' : '/mi-cuenta'));
  }
}
