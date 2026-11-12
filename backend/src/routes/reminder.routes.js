import { Router } from 'express';
import { reminderController } from '../controllers/reminder.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createReminderSchema,
  updateReminderSchema,
  deleteReminderSchema,
} from '../validators/reminder.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', reminderController.list);
router.post('/', validate(createReminderSchema), reminderController.create);
router.patch('/:id', validate(updateReminderSchema), reminderController.update);
router.delete('/:id', validate(deleteReminderSchema), reminderController.delete);

export default router;

