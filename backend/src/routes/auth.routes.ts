import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller.ts';
import { validateJWT } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', validateJWT, getMe);

export default router;
