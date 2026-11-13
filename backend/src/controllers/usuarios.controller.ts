import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UsuarioModel, MIN_PASSWORD_LENGTH } from '../models/usuario.model.ts';
import { handleError } from '../Helpers/Error.helper.ts';

export const getUsuarios = async (_req: Request, res: Response) => {
    try {
        const usuarios = await UsuarioModel.find();
        res.status(200).json(usuarios);
    } catch (error) {
        handleError(res, 'Error al obtener los usuarios', error);
    }
};

export const getUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
        res.status(400).json({ ok: false, msg: 'El id no es valido' });
        return;
    }

    try {
        const usuario = await UsuarioModel.findById(id);

        if (!usuario) {
            res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
            return;
        }

        res.status(200).json(usuario);
    } catch (error) {
        handleError(res, 'Error al obtener el usuario', error);
    }
};

// Solo administrador. A diferencia del registro publico, aqui si se puede elegir el rol.
export const createUsuario = async (req: Request, res: Response) => {
    const { nombre, apellidos, correo, telefono, contrasena, rol } = req.body ?? {};

    if (!nombre || !apellidos || !correo || !telefono || !contrasena) {
        res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
        return;
    }

    if ([nombre, apellidos, correo, telefono, contrasena].some((valor) => typeof valor !== 'string')
        || (rol !== undefined && typeof rol !== 'string')) {
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
            rol,
            contrasena: await bcrypt.hash(contrasena, 10),
        });
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        handleError(res, 'Error al crear el usuario', error);
    }
};

// Administrador o el propio usuario. Solo un administrador puede cambiar el rol.
export const updateUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, apellidos, correo, telefono, contrasena, contrasenaActual, rol } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(id)) {
        res.status(400).json({ ok: false, msg: 'El id no es valido' });
        return;
    }

    const cambios: Record<string, string> = {};

    for (const [campo, valor] of Object.entries({ nombre, apellidos, correo, telefono })) {
        if (valor === undefined) continue;

        if (typeof valor !== 'string' || !valor.trim()) {
            res.status(400).json({ ok: false, msg: `El campo ${campo} no es válido` });
            return;
        }

        cambios[campo] = valor;
    }

    if (contrasena !== undefined
        && (typeof contrasena !== 'string' || contrasena.length < MIN_PASSWORD_LENGTH)) {
        res.status(400).json({
            ok: false,
            msg: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
        });
        return;
    }

    // Quien cambia su propia contraseña debe demostrar que conoce la actual.
    // Un administrador que cambia la de otro usuario no la necesita.
    const cambiaSuPropiaContrasena = contrasena !== undefined && res.locals.usuario.id === id;

    if (cambiaSuPropiaContrasena && (typeof contrasenaActual !== 'string' || !contrasenaActual)) {
        res.status(400).json({ ok: false, msg: 'Debes indicar tu contraseña actual' });
        return;
    }

    if (rol !== undefined) {
        if (res.locals.usuario.rol !== 'administrador') {
            res.status(403).json({ ok: false, msg: 'Solo un administrador puede cambiar el rol' });
            return;
        }

        if (typeof rol !== 'string') {
            res.status(400).json({ ok: false, msg: 'El campo rol no es válido' });
            return;
        }

        cambios.rol = rol;
    }

    if (contrasena === undefined && Object.keys(cambios).length === 0) {
        res.status(400).json({ ok: false, msg: 'No se enviaron datos para actualizar' });
        return;
    }

    try {
        if (cambiaSuPropiaContrasena) {
            const actual = await UsuarioModel.findById(id).select('+contrasena');

            // 400 (y no 401) para que el frontend no lo confunda con una sesion vencida.
            if (!actual || !(await bcrypt.compare(contrasenaActual, actual.contrasena as string))) {
                res.status(400).json({ ok: false, msg: 'La contraseña actual es incorrecta' });
                return;
            }
        }

        if (contrasena !== undefined) {
            cambios.contrasena = await bcrypt.hash(contrasena, 10);
        }

        const usuario = await UsuarioModel.findByIdAndUpdate(id, cambios, {
            new: true,
            runValidators: true,
        });

        if (!usuario) {
            res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
            return;
        }

        res.status(200).json(usuario);
    } catch (error) {
        handleError(res, 'Error al actualizar el usuario', error);
    }
};

// Solo administrador. No puede borrar su propia cuenta para no quedarse sin acceso.
export const deleteUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
        res.status(400).json({ ok: false, msg: 'El id no es valido' });
        return;
    }

    if (res.locals.usuario.id === id) {
        res.status(400).json({ ok: false, msg: 'No puedes eliminar tu propia cuenta' });
        return;
    }

    try {
        const deleted = await UsuarioModel.findByIdAndDelete(id);

        if (!deleted) {
            res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        handleError(res, 'Error al eliminar el usuario', error);
    }
};
