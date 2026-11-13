import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { API_URL } from '../config/api-config';
import { RolUsuario, Usuario } from '../models/usuario.model';
import { mensajeDeError } from '../utils/api-error';

const CLAVE_TOKEN = 'disfraces_express_token';

/** Tope de espera al recuperar la sesión: bloquea el arranque de la app, así que no puede colgarse. */
const ESPERA_MAXIMA_RESTAURAR_MS = 5000;

interface RespuestaAuth {
  ok: boolean;
  msg: string;
  usuario: Usuario;
  token: string;
}

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasena: string;
}

/**
 * Autenticación contra la API (JWT). El token se guarda en localStorage para
 * conservar la sesión al recargar; `restaurarSesion()` lo valida al arrancar la app.
 *
 * Los métodos que llaman a la API devuelven una Promise que se rechaza con un
 * `Error` cuyo `message` ya es un texto listo para mostrar al usuario.
 */
@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  private readonly usuarioActualSignal = signal<Usuario | null>(null);
  private readonly tokenSignal = signal<string | null>(this.leerToken());

  readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioActualSignal() !== null);
  readonly rol = computed<RolUsuario | null>(() => this.usuarioActualSignal()?.rol ?? null);
  readonly esAdmin = computed(() => this.rol() === 'administrador');
  readonly esCliente = computed(() => this.rol() === 'cliente');

  /**
   * Si hay un token guardado, pide el usuario al backend. Se ejecuta antes de que
   * arranque la app (provideAppInitializer) para que los guards ya conozcan la sesión.
   * Nunca se rechaza: si falla, simplemente no hay sesión.
   */
  async restaurarSesion(): Promise<void> {
    if (!this.tokenSignal()) return;

    try {
      const respuesta = await firstValueFrom(
        this.http
          .get<{ ok: boolean; usuario: Usuario }>(`${API_URL}/auth/me`)
          .pipe(timeout(ESPERA_MAXIMA_RESTAURAR_MS)),
      );
      this.usuarioActualSignal.set(respuesta.usuario);
    } catch (error) {
      // 401: token vencido o usuario eliminado, ya no sirve. Con otros errores
      // (backend apagado o sin responder) se conserva para reintentar en la siguiente carga.
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.guardarToken(null);
      }
    }
  }

  async login(correo: string, contrasena: string): Promise<void> {
    const respuesta = await this.solicitar(
      this.http.post<RespuestaAuth>(`${API_URL}/auth/login`, { correo, contrasena }),
      'No se pudo iniciar sesión.',
    );
    this.iniciarSesion(respuesta);
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    const respuesta = await this.solicitar(
      this.http.post<RespuestaAuth>(`${API_URL}/auth/register`, datos),
      'No se pudo crear la cuenta.',
    );
    this.iniciarSesion(respuesta);
  }

  logout(): void {
    this.guardarToken(null);
    this.usuarioActualSignal.set(null);
  }

  async actualizarPerfil(
    cambios: Partial<Pick<Usuario, 'nombre' | 'apellidos' | 'correo' | 'telefono'>>,
  ): Promise<void> {
    const actual = this.usuarioActualSignal();
    if (!actual) return;

    const actualizado = await this.solicitar(
      this.http.put<Usuario>(`${API_URL}/usuarios/${actual.id}`, cambios),
      'No se pudieron guardar los cambios.',
    );
    this.usuarioActualSignal.set(actualizado);
  }

  async cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Promise<void> {
    const actual = this.usuarioActualSignal();
    if (!actual) return;

    await this.solicitar(
      this.http.put<Usuario>(`${API_URL}/usuarios/${actual.id}`, {
        contrasena: contrasenaNueva,
        contrasenaActual,
      }),
      'No se pudo actualizar la contraseña.',
    );
  }

  private iniciarSesion(respuesta: RespuestaAuth): void {
    this.guardarToken(respuesta.token);
    this.usuarioActualSignal.set(respuesta.usuario);
  }

  private async solicitar<T>(peticion: Observable<T>, mensajePorDefecto: string): Promise<T> {
    try {
      return await firstValueFrom(peticion);
    } catch (error) {
      throw new Error(mensajeDeError(error, mensajePorDefecto));
    }
  }

  private leerToken(): string | null {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  private guardarToken(token: string | null): void {
    this.tokenSignal.set(token);
    try {
      if (token) {
        localStorage.setItem(CLAVE_TOKEN, token);
      } else {
        localStorage.removeItem(CLAVE_TOKEN);
      }
    } catch {
      // Sin acceso a localStorage (modo privado, etc.): la sesión dura mientras la pestaña.
    }
  }
}
