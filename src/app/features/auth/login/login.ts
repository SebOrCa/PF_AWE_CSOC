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

  iniciarSesion(): void {
    if (!this.correo() || !this.contrasena()) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }
    this.error.set('');
    this.auth.login(this.correo(), this.contrasena());
    this.redirigirDespuesDeLogin();
  }

  entrarComoCliente(): void {
    this.auth.entrarComoCliente();
    this.redirigirDespuesDeLogin();
  }

  entrarComoAdmin(): void {
    this.auth.entrarComoAdmin();
    this.router.navigate(['/admin']);
  }

  private redirigirDespuesDeLogin(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    this.router.navigateByUrl(redirectTo ?? '/mi-cuenta');
  }
}
