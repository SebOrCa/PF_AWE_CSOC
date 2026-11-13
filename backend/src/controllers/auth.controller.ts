import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UsuarioModel, MIN_PASSWORD_LENGTH } from '../models/usuario.model.ts';
import { generateJWT } from '../Helpers/Jwt.helper.ts';
import { handleError } from '../Helpers/Error.helper.ts';

// Registro publico: siempre crea un usuario con rol "cliente" (el rol del body se ignora).
export const register = async (req: Request, res: Response) => {
    const { nombre, apellidos, correo, telefono, contrasena } = req.body ?? {};

    if (!nombre || !apellidos || !correo || !telefono || !contrasena) {
        res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
        return;
    }

    if ([nombre, apellidos, correo, telefono, contrasena].some((valor) => typeof valor !== 'string')) {
        res.status(400).json({ ok: false, msg: 'Los datos enviados no son válidos' });
        return;
    }

    if (contrasena.length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({
            ok: false,
            msg: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
        });
        return;
    }

    try {
        const usuario = new UsuarioModel({
            nombre,
            apellidos,
            correo,
            telefono,
            contrasena: await bcrypt.hash(contrasena, 10),
        });
        await usuario.save();

        const token = await generateJWT(usuario.id);

        res.status(201).json({
            ok: true,
            msg: 'Registro exitoso',
            usuario,
            token
        });
    } catch (error) {
        handleError(res, 'Error al registrar el usuario', error);
    }
}

export const login = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body ?? {};

    // Se exige texto para que no se puedan mandar operadores de Mongo ({ "$ne": null }) como correo.
    if (!correo || !contrasena || typeof correo !== 'string' || typeof contrasena !== 'string') {
        res.status(400).json({ ok: false, msg: 'El correo y la contraseña son obligatorios' });
        return;
    }

    try {
        const usuario = await UsuarioModel
            .findOne({ correo: correo.trim().toLowerCase() })
            .select('+contrasena');

        // Mongoose tipa como unknown los campos con select: false; aqui ya viene cargado.
        if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena as string))) {
            res.status(401).json({
                ok: false,
                msg: 'Credenciales inválidas'
            });
            return;
        }

        const token = await generateJWT(usuario.id);

        res.status(200).json({
            ok: true,
            msg: 'Login exitoso',
            usuario,
            token
        });
    } catch (error) {
        handleError(res, 'Error interno del servidor', error);
    }
}

// Devuelve el usuario dueño del token (sirve para recuperar la sesion al recargar el frontend).
export const getMe = (_req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        usuario: res.locals.usuario
    });
}
