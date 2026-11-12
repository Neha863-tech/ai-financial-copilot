import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    direction: z.enum(['INCOME', 'EXPENSE', 'BOTH']).optional().default('BOTH'),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    direction: z.enum(['INCOME', 'EXPENSE', 'BOTH']).optional(),
  }),
});

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.patch('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;

