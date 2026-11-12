import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, profileController.getProfile);
router.put('/', optionalAuthenticate, profileController.updateProfile);
router.put('/avatar', optionalAuthenticate, profileController.updateAvatar);
router.put('/password', authenticate, profileController.changePassword);
router.get('/notification-preferences', optionalAuthenticate, profileController.getNotificationPreferences);
router.put('/notification-preferences', optionalAuthenticate, profileController.updateNotificationPreferences);
router.get('/export-data', optionalAuthenticate, profileController.exportUserData);
router.delete('/', authenticate, profileController.deleteAccount);

export default router;
