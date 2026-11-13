import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LONGITUD_MINIMA_CONTRASENA } from '../../../../core/models/usuario.model';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-perfil-tab',
  imports: [FormsModule],
  templateUrl: './perfil-tab.html',
  styleUrl: './perfil-tab.css',
})
export class PerfilTab {
  private readonly auth = inject(Auth);

  private readonly usuario = this.auth.usuarioActual();

  readonly nombre = signal(this.usuario?.nombre ?? '');
  readonly apellidos = signal(this.usuario?.apellidos ?? '');
  readonly correo = signal(this.usuario?.correo ?? '');
  readonly telefono = signal(this.usuario?.telefono ?? '');
  readonly guardado = signal(false);
  readonly errorPerfil = signal('');

  readonly contrasenaActual = signal('');
  readonly contrasenaNueva = signal('');
  readonly contrasenaConfirmar = signal('');
  readonly contrasenaActualizada = signal(false);
  readonly errorContrasena = signal('');

  async guardarCambios(): Promise<void> {
    this.errorPerfil.set('');

    try {
      await this.auth.actualizarPerfil({
        nombre: this.nombre(),
        apellidos: this.apellidos(),
        correo: this.correo(),
        telefono: this.telefono(),
      });

      // El backend normaliza los datos (espacios, correo en minúsculas): se muestran tal como quedaron.
      const guardado = this.auth.usuarioActual();
      if (guardado) {
        this.nombre.set(guardado.nombre);
        this.apellidos.set(guardado.apellidos);
        this.correo.set(guardado.correo);
        this.telefono.set(guardado.telefono);
      }

      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 2000);
    } catch (error) {
      this.errorPerfil.set((error as Error).message);
    }
  }

  async actualizarContrasena(): Promise<void> {
    this.errorContrasena.set('');

    if (!this.contrasenaActual() || !this.contrasenaNueva() || !this.contrasenaConfirmar()) {
      this.errorContrasena.set('Completa los tres campos.');
      return;
    }
    if (this.contrasenaNueva().length < LONGITUD_MINIMA_CONTRASENA) {
      this.errorContrasena.set(
        `La nueva contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
      );
      return;
    }
    if (this.contrasenaNueva() !== this.contrasenaConfirmar()) {
      this.errorContrasena.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      await this.auth.cambiarContrasena(this.contrasenaActual(), this.contrasenaNueva());

      this.contrasenaActual.set('');
      this.contrasenaNueva.set('');
      this.contrasenaConfirmar.set('');
      this.contrasenaActualizada.set(true);
      setTimeout(() => this.contrasenaActualizada.set(false), 2000);
    } catch (error) {
      this.errorContrasena.set((error as Error).message);
    }
  }
}
