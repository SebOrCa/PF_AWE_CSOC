import { Router } from 'express';
import {
    getUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
} from '../controllers/usuarios.controller.ts';
import { validateJWT, validateRole, validateAdminOrSelf } from '../middlewares/auth.middleware.ts';

const router = Router();

// Todas las rutas de usuarios requieren sesion iniciada.
router.use(validateJWT);

router.get('/', validateRole('administrador'), getUsuarios);
router.get('/:id', validateAdminOrSelf, getUsuario);
router.post('/', validateRole('administrador'), createUsuario);
router.put('/:id', validateAdminOrSelf, updateUsuario);
router.delete('/:id', validateRole('administrador'), deleteUsuario);

export default router;
