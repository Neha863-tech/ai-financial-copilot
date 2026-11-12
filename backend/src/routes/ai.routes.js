import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';
import { chatSchema, conversationIdSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(authenticate);

router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.get('/conversations', aiController.getConversations);
router.get('/conversations/:id', validate(conversationIdSchema), aiController.getConversation);
router.delete('/conversations/:id', validate(conversationIdSchema), aiController.deleteConversation);

export default router;
