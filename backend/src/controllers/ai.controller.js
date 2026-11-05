import { aiAssistantService } from '../integrations/ai/aiAssistant.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const aiController = {
  chat: asyncHandler(async (req, res) => {
    const result = await aiAssistantService.chat(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Response generated', result));
  }),

  getConversations: asyncHandler(async (req, res) => {
    const conversations = await aiAssistantService.getConversations(req.user.id);
    res.status(200).json(ApiResponse.success('Conversations retrieved', { conversations }));
  }),

  getConversation: asyncHandler(async (req, res) => {
    const conversation = await aiAssistantService.getConversation(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success('Conversation retrieved', { conversation }));
  }),

  deleteConversation: asyncHandler(async (req, res) => {
    const result = await aiAssistantService.deleteConversation(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};

