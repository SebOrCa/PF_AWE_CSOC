import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LONGITUD_MINIMA_CONTRASENA } from '../../../core/models/usuario.model';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly nombre = signal('');
  readonly apellidos = signal('');
  readonly correo = signal('');
  readonly contrasena = signal('');
  readonly confirmarContrasena = signal('');
  readonly telefono = signal('');
  readonly error = signal('');
  readonly cargando = signal(false);

  readonly contrasenasCoinciden = computed(
    () => this.contrasena() === this.confirmarContrasena() || this.confirmarContrasena() === '',
  );

  async crearCuenta(): Promise<void> {
    if (
      !this.nombre() ||
      !this.apellidos() ||
      !this.correo() ||
      !this.telefono() ||
      !this.contrasena()
    ) {
      this.error.set('Completa todos los campos obligatorios.');
      return;
    }
    if (this.contrasena().length < LONGITUD_MINIMA_CONTRASENA) {
      this.error.set(`La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`);
      return;
    }
    if (this.contrasena() !== this.confirmarContrasena()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.error.set('');
    this.cargando.set(true);

    try {
      await this.auth.registrar({
        nombre: this.nombre(),
        apellidos: this.apellidos(),
        correo: this.correo(),
        telefono: this.telefono(),
        contrasena: this.contrasena(),
      });
      this.router.navigate(['/mi-cuenta']);
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }
}
