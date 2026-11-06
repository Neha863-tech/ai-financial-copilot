import { aiAssistantService } from '../integrations/ai/aiAssistant.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const aiController = {
  chat: asyncHandler(async (req, res) => {
    const userId = req.user?.id || 'demo-user-1';
    const result = await aiAssistantService.chat(userId, req.body);
    res.status(200).json(ApiResponse.success('Response generated', result));
  }),

  getConversations: asyncHandler(async (req, res) => {
    const userId = req.user?.id || 'demo-user-1';
    const conversations = await aiAssistantService.getConversations(userId);
    res.status(200).json(ApiResponse.success('Conversations retrieved', { conversations }));
  }),

  getConversation: asyncHandler(async (req, res) => {
    const userId = req.user?.id || 'demo-user-1';
    const conversation = await aiAssistantService.getConversation(userId, req.params.id);
    res.status(200).json(ApiResponse.success('Conversation retrieved', { conversation }));
  }),

  deleteConversation: asyncHandler(async (req, res) => {
    const userId = req.user?.id || 'demo-user-1';
    const result = await aiAssistantService.deleteConversation(userId, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};
