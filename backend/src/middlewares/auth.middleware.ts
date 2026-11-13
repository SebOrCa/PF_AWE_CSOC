import type { NextFunction, Request, Response } from 'express';
import { UsuarioModel, type RolUsuario } from '../models/usuario.model.ts';
import { verifyJWT } from '../Helpers/Jwt.helper.ts';
import { handleError } from '../Helpers/Error.helper.ts';

// Lee el header "Authorization: Bearer <token>", valida el token y deja el
// usuario completo en res.locals.usuario para los siguientes handlers.
export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('Authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ ok: false, msg: 'No hay token en la petición' });
        return;
    }

    let uid: string;
    try {
        uid = verifyJWT(token);
    } catch {
        res.status(401).json({ ok: false, msg: 'Token no válido o expirado' });
        return;
    }

    try {
        const usuario = await UsuarioModel.findById(uid);

        if (!usuario) {
            res.status(401).json({ ok: false, msg: 'Token no válido: el usuario ya no existe' });
            return;
        }

        res.locals.usuario = usuario;
        next();
    } catch (error) {
        handleError(res, 'Error al validar el token', error);
    }
};

// Debe ir despues de validateJWT.
export const validateRole = (...roles: RolUsuario[]) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(res.locals.usuario.rol)) {
            res.status(403).json({ ok: false, msg: 'No tienes permisos para realizar esta acción' });
            return;
        }

        next();
    };
};

// Permite el paso a un administrador o al propio usuario dueño del recurso (:id).
// Debe ir despues de validateJWT.
export const validateAdminOrSelf = (req: Request, res: Response, next: NextFunction) => {
    const { usuario } = res.locals;

    if (usuario.rol !== 'administrador' && usuario.id !== req.params.id) {
        res.status(403).json({ ok: false, msg: 'No tienes permisos para realizar esta acción' });
        return;
    }

    next();
};
