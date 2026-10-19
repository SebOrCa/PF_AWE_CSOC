import { Service, computed, signal } from '@angular/core';
import { RolUsuario, Usuario } from '../models/usuario.model';

/**
 * Autenticación simulada en memoria. No hay backend todavía: este servicio
 * se reemplazará por llamadas HTTP + JWT cuando la API esté disponible.
 */
@Service()
export class Auth {
  private readonly usuarioActualSignal = signal<Usuario | null>(null);

  readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioActualSignal() !== null);
  readonly rol = computed<RolUsuario | null>(() => this.usuarioActualSignal()?.rol ?? null);
  readonly esAdmin = computed(() => this.rol() === 'administrador');
  readonly esCliente = computed(() => this.rol() === 'cliente');

  private readonly usuarioDemoCliente: Usuario = {
    id: 'u-cliente-demo',
    nombre: 'María',
    apellidos: 'López García',
    correo: 'maria@correo.com',
    telefono: '55 1234 5678',
    rol: 'cliente',
    clienteDesde: 2024,
  };

  private readonly usuarioDemoAdmin: Usuario = {
    id: 'u-admin-demo',
    nombre: 'Admin',
    apellidos: 'Disfraces Express',
    correo: 'admin@disfracesexpress.com',
    telefono: '55 0000 0000',
    rol: 'administrador',
    clienteDesde: 2023,
  };

  login(correo: string, _contrasena: string): void {
    // Sin backend: cualquier combinación entra como la cuenta cliente de demostración.
    this.usuarioActualSignal.set({ ...this.usuarioDemoCliente, correo: correo || this.usuarioDemoCliente.correo });
  }

  registrar(datos: { nombre: string; apellidos: string; correo: string; telefono: string }): void {
    this.usuarioActualSignal.set({
      id: 'u-' + Date.now(),
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      correo: datos.correo,
      telefono: datos.telefono,
      rol: 'cliente',
      clienteDesde: new Date().getFullYear(),
    });
  }

  entrarComoCliente(): void {
    this.usuarioActualSignal.set(this.usuarioDemoCliente);
  }

  entrarComoAdmin(): void {
    this.usuarioActualSignal.set(this.usuarioDemoAdmin);
  }

  salirAVisitante(): void {
    this.usuarioActualSignal.set(null);
  }

  logout(): void {
    this.usuarioActualSignal.set(null);
  }

  actualizarPerfil(cambios: Partial<Pick<Usuario, 'nombre' | 'apellidos' | 'correo' | 'telefono'>>): void {
    const actual = this.usuarioActualSignal();
    if (!actual) return;
    this.usuarioActualSignal.set({ ...actual, ...cambios });
  }
}
