import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';
import { chatSchema, conversationIdSchema } from '../validators/ai.validator.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();

router.use(authenticate);

router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.post('/summary', aiController.getSummary);
router.post('/categorize', aiController.categorize);
router.post('/forecast', aiController.forecast);
router.post('/affordability', aiController.affordability);
router.post('/documents/upload', upload.single('file'), aiController.uploadDocument);
router.get('/conversations', aiController.getConversations);
router.get('/conversations/:id', validate(conversationIdSchema), aiController.getConversation);
router.delete('/conversations/:id', validate(conversationIdSchema), aiController.deleteConversation);

export default router;
