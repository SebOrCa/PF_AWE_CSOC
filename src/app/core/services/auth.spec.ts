import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from '../interceptors/auth-interceptor';
import { Usuario } from '../models/usuario.model';
import { Auth } from './auth';

const CLAVE_TOKEN = 'disfraces_express_token';

const usuarioCliente: Usuario = {
  id: 'abc123',
  nombre: 'María',
  apellidos: 'López',
  correo: 'maria@correo.com',
  telefono: '5512345678',
  rol: 'cliente',
  clienteDesde: 2026,
};

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;

  function crear(): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => localStorage.removeItem(CLAVE_TOKEN));
  afterEach(() => {
    http.verify();
    localStorage.removeItem(CLAVE_TOKEN);
  });

  it('login guarda el usuario y el token', async () => {
    crear();

    const promesa = auth.login('maria@correo.com', 'secreto1');
    const peticion = http.expectOne('/api/auth/login');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ correo: 'maria@correo.com', contrasena: 'secreto1' });
    peticion.flush({ ok: true, msg: 'Login exitoso', usuario: usuarioCliente, token: 'jwt-123' });
    await promesa;

    expect(auth.estaAutenticado()).toBe(true);
    expect(auth.esCliente()).toBe(true);
    expect(auth.esAdmin()).toBe(false);
    expect(auth.token()).toBe('jwt-123');
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-123');
  });

  it('login con error muestra el mensaje del backend y no inicia sesión', async () => {
    crear();

    const promesa = auth.login('maria@correo.com', 'mala');
    http.expectOne('/api/auth/login').flush(
      { ok: false, msg: 'Credenciales inválidas' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await expect(promesa).rejects.toThrow('Credenciales inválidas');
    expect(auth.estaAutenticado()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('con el backend apagado el error es claro', async () => {
    crear();

    const promesa = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').error(new ProgressEvent('error'), { status: 0 });

    await expect(promesa).rejects.toThrow('No se pudo conectar con el servidor');
  });

  it('si el proxy no alcanza al backend (502) también avisa que no hay conexión', async () => {
    crear();

    const promesa = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').flush('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' });

    await expect(promesa).rejects.toThrow('No se pudo conectar con el servidor');
  });

  it('restaurarSesion con token válido recupera al usuario', async () => {
    localStorage.setItem(CLAVE_TOKEN, 'jwt-guardado');
    crear();

    const promesa = auth.restaurarSesion();
    const peticion = http.expectOne('/api/auth/me');
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer jwt-guardado');
    peticion.flush({ ok: true, usuario: usuarioCliente });
    await promesa;

    expect(auth.usuarioActual()?.correo).toBe('maria@correo.com');
  });

  it('restaurarSesion con token vencido (401) descarta el token y no redirige', async () => {
    localStorage.setItem(CLAVE_TOKEN, 'jwt-vencido');
    crear();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');

    const promesa = auth.restaurarSesion();
    http.expectOne('/api/auth/me').flush(
      { ok: false, msg: 'Token no válido o expirado' },
      { status: 401, statusText: 'Unauthorized' },
    );
    await promesa;

    expect(auth.estaAutenticado()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('restaurarSesion no bloquea la app más de 5 s si el backend no responde, y conserva el token', async () => {
    vi.useFakeTimers();
    try {
      localStorage.setItem(CLAVE_TOKEN, 'jwt-guardado');
      crear();

      const promesa = auth.restaurarSesion();
      http.expectOne('/api/auth/me'); // la petición queda sin respuesta
      await vi.advanceTimersByTimeAsync(5001);
      await promesa;

      expect(auth.estaAutenticado()).toBe(false);
      expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-guardado');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restaurarSesion sin token no llama al backend', async () => {
    crear();
    await auth.restaurarSesion();
    http.expectNone('/api/auth/me');
    expect(auth.estaAutenticado()).toBe(false);
  });

  it('logout limpia usuario y token', async () => {
    crear();
    const promesa = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').flush({ ok: true, msg: '', usuario: usuarioCliente, token: 'jwt-123' });
    await promesa;

    auth.logout();

    expect(auth.estaAutenticado()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('actualizarPerfil envía los cambios y conserva lo que devuelve el backend', async () => {
    crear();
    const login = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').flush({ ok: true, msg: '', usuario: usuarioCliente, token: 'jwt-123' });
    await login;

    const promesa = auth.actualizarPerfil({ nombre: '  María José ', telefono: '5599999999' });
    const peticion = http.expectOne('/api/usuarios/abc123');
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    peticion.flush({ ...usuarioCliente, nombre: 'María José', telefono: '5599999999' });
    await promesa;

    expect(auth.usuarioActual()?.nombre).toBe('María José');
  });

  it('cambiarContrasena manda la actual y la nueva', async () => {
    crear();
    const login = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').flush({ ok: true, msg: '', usuario: usuarioCliente, token: 'jwt-123' });
    await login;

    const promesa = auth.cambiarContrasena('secreto1', 'nuevaclave9');
    const peticion = http.expectOne('/api/usuarios/abc123');
    expect(peticion.request.body).toEqual({ contrasena: 'nuevaclave9', contrasenaActual: 'secreto1' });
    peticion.flush(usuarioCliente);
    await promesa;
  });
});

describe('authInterceptor', () => {
  let auth: Auth;
  let http: HttpTestingController;
  let cliente: HttpClient;

  async function iniciarSesion(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
    cliente = TestBed.inject(HttpClient);

    const promesa = auth.login('maria@correo.com', 'secreto1');
    http.expectOne('/api/auth/login').flush({ ok: true, msg: '', usuario: usuarioCliente, token: 'jwt-123' });
    await promesa;
  }

  beforeEach(() => localStorage.removeItem(CLAVE_TOKEN));
  afterEach(() => {
    http.verify();
    localStorage.removeItem(CLAVE_TOKEN);
  });

  it('no manda el token a URLs que no son de la API', async () => {
    await iniciarSesion();

    cliente.get('https://otro-sitio.com/datos').subscribe();
    const peticion = http.expectOne('https://otro-sitio.com/datos');

    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it('un 401 con sesión iniciada cierra la sesión y redirige al login', async () => {
    await iniciarSesion();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    cliente.get('/api/usuarios').subscribe({ error: () => undefined });
    http.expectOne('/api/usuarios').flush(
      { ok: false, msg: 'Token no válido o expirado' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(auth.estaAutenticado()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('un 403 (sin permisos) NO cierra la sesión', async () => {
    await iniciarSesion();

    cliente.get('/api/usuarios').subscribe({ error: () => undefined });
    http.expectOne('/api/usuarios').flush(
      { ok: false, msg: 'No tienes permisos para realizar esta acción' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(auth.estaAutenticado()).toBe(true);
  });
});
