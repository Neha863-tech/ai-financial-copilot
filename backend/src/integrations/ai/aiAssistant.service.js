import { createAIProvider } from './providerFactory.js';
import { toolRegistry } from './tools/toolRegistry.js';
import { ASSISTANT_SYSTEM_PROMPT } from './prompts/assistant.prompt.js';
import { aiConfig } from '../../config/ai.js';
import prisma from '../../db/prisma.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

let aiProvider = null;

function getProvider() {
  if (!aiProvider) {
    aiProvider = createAIProvider();
  }
  return aiProvider;
}

export const aiAssistantService = {
  async chat(userId, { conversationId, message }) {
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) {
        throw ApiError.notFound('Conversation not found');
      }
    } else {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: message.substring(0, 100),
        },
      });
    }

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    const recentMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const aiMessages = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...recentMessages.map(m => ({
        role: m.role === 'USER' ? 'user' : m.role === 'ASSISTANT' ? 'assistant' : 'tool',
        content: m.content,
        toolName: m.toolName || undefined,
      })),
    ];

    const tools = toolRegistry.getToolDefinitions();
    const provider = getProvider();

    let response;
    try {
      response = await provider.generateResponse({
        messages: aiMessages,
        tools,
        model: aiConfig.model,
        temperature: aiConfig.temperature,
      });
    } catch (err) {
      logger.error('Error generating AI response:', { error: err.message });
      response = { text: 'I am currently having trouble reaching the AI service. Please ensure AI_API_KEY is configured.', toolCalls: [] };
    }

    const evidence = [];
    let rounds = 0;

    while (response.toolCalls && response.toolCalls.length > 0 && rounds < aiConfig.maxToolRounds) {
      rounds++;
      const toolResults = [];

      for (const toolCall of response.toolCalls) {
        if (!toolRegistry.isAllowed(toolCall.name)) {
          logger.warn('AI requested disallowed tool', { toolName: toolCall.name });
          toolResults.push({
            name: toolCall.name,
            result: { error: 'Tool not available' },
          });
          continue;
        }

        try {
          const result = await toolRegistry.executeTool(toolCall.name, toolCall.arguments, userId);
          toolResults.push({ name: toolCall.name, result });

          await prisma.aIMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'TOOL',
              content: JSON.stringify(result),
              toolName: toolCall.name,
            },
          });

          evidence.push({
            tool: toolCall.name,
            data: result,
          });
        } catch (error) {
          logger.error('Tool execution failed', { tool: toolCall.name, error: error.message });
          toolResults.push({
            name: toolCall.name,
            result: { error: `Tool execution failed: ${error.message}` },
          });
        }
      }

      const updatedMessages = await prisma.aIMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        take: 30,
      });

      const updatedAiMessages = [
        { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
        ...updatedMessages.map(m => ({
          role: m.role === 'USER' ? 'user' : m.role === 'ASSISTANT' ? 'assistant' : 'tool',
          content: m.content,
          toolName: m.toolName || undefined,
        })),
      ];

      try {
        response = await provider.sendToolResults(
          updatedAiMessages,
          tools,
          toolResults,
          aiConfig.model,
          aiConfig.temperature
        );
      } catch (err) {
        logger.error('Error sending tool results:', { error: err.message });
        break;
      }
    }

    const assistantMessage = response.text || 'I analyzed your data, but could not produce a textual explanation.';
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: assistantMessage,
      },
    });

    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId: conversation.id,
      answer: assistantMessage,
      evidence: evidence.length > 0 ? evidence : undefined,
    };
  },

  async getConversations(userId) {
    return prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  },

  async getConversation(userId, conversationId) {
    const conversation = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    return conversation;
  },

  async deleteConversation(userId, conversationId) {
    const conversation = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    await prisma.aIConversation.delete({ where: { id: conversationId } });
    return { message: 'Conversation deleted successfully' };
  },
};

