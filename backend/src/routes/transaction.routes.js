import { Router } from 'express';
import multer from 'multer';
import { transactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  listTransactionsSchema,
} from '../validators/transaction.validator.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.use(authenticate);

router.get('/', validate(listTransactionsSchema), transactionController.list);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.post('/import/csv', upload.single('file'), transactionController.importCsv);
router.get('/:id', validate(getTransactionSchema), transactionController.getById);
router.patch('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', validate(getTransactionSchema), transactionController.delete);

export default router;

