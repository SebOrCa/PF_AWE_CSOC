import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  readonly contrasenaActual = signal('');
  readonly contrasenaNueva = signal('');
  readonly contrasenaConfirmar = signal('');

  guardarCambios(): void {
    this.auth.actualizarPerfil({
      nombre: this.nombre(),
      apellidos: this.apellidos(),
      correo: this.correo(),
      telefono: this.telefono(),
    });
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2000);
  }

  actualizarContrasena(): void {
    this.contrasenaActual.set('');
    this.contrasenaNueva.set('');
    this.contrasenaConfirmar.set('');
  }
}
