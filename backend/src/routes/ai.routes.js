import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';
import { chatSchema, conversationIdSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(optionalAuthenticate);

router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.post('/summary', aiController.getSummary);
router.post('/categorize', aiController.categorize);
router.post('/forecast', aiController.forecast);
router.post('/affordability', aiController.affordability);
router.get('/conversations', aiController.getConversations);
router.get('/conversations/:id', validate(conversationIdSchema), aiController.getConversation);
router.delete('/conversations/:id', validate(conversationIdSchema), aiController.deleteConversation);

export default router;
