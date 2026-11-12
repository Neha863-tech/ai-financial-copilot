import { Router } from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, sessionController.getSessions);
router.get('/login-history', optionalAuthenticate, sessionController.getLoginHistory);
router.delete('/:id', optionalAuthenticate, sessionController.revokeSession);
router.post('/revoke-others', optionalAuthenticate, sessionController.revokeOthers);
router.post('/revoke-all', optionalAuthenticate, sessionController.revokeAll);

export default router;
