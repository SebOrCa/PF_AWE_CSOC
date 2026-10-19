import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  readonly contrasenasCoinciden = computed(
    () => this.contrasena() === this.confirmarContrasena() || this.confirmarContrasena() === '',
  );

  crearCuenta(): void {
    if (!this.nombre() || !this.apellidos() || !this.correo() || !this.contrasena()) {
      this.error.set('Completa todos los campos obligatorios.');
      return;
    }
    if (this.contrasena() !== this.confirmarContrasena()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.error.set('');
    this.auth.registrar({
      nombre: this.nombre(),
      apellidos: this.apellidos(),
      correo: this.correo(),
      telefono: this.telefono(),
    });
    this.router.navigate(['/mi-cuenta']);
  }
}
