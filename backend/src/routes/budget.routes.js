import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  deleteBudgetSchema,
} from '../validators/budget.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.list);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.patch('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', validate(deleteBudgetSchema), budgetController.delete);

export default router;

