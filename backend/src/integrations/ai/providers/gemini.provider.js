import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig } from '../../../config/ai.js';
import { AIProvider } from '../aiProvider.js';
import { logger } from '../../../utils/logger.js';

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.client = null;
    if (aiConfig.apiKey && aiConfig.apiKey !== 'replace_me') {
      this.client = new GoogleGenerativeAI(aiConfig.apiKey);
    }
  }

  async generateResponse({ messages, tools, model, temperature }) {
    if (!this.client) {
      return {
        text: 'AI provider is not configured. Please add a valid AI_API_KEY in the environment settings.',
        toolCalls: [],
      };
    }

    try {
      const modelName = model || aiConfig.model || 'gemini-2.0-flash';
      const genModel = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: temperature ?? aiConfig.temperature,
        },
      });

      const geminiTools = tools && tools.length > 0 ? [{
        functionDeclarations: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      }] : undefined;

      const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => this.convertMessage(m));

      if (chatMessages.length === 0) {
        return { text: 'Hello! How can I assist you with your finances today?', toolCalls: [] };
      }

      const chat = genModel.startChat({
        history: chatMessages.slice(0, -1),
        systemInstruction,
        tools: geminiTools,
      });

      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);

      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate) {
        return { text: 'I could not generate a response. Please try again.', toolCalls: [] };
      }

      const parts = candidate.content?.parts || [];
      let text = '';
      const toolCalls = [];

      for (const part of parts) {
        if (part.text) {
          text += part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            type: 'tool_call',
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          });
        }
      }

      return { text, toolCalls };
    } catch (error) {
      logger.error('Gemini API error', { error: error.message });
      throw new Error(`AI provider error: ${error.message}`);
    }
  }

  async sendToolResults(messages, tools, toolResults, model, temperature) {
    if (!this.client) {
      return { text: 'AI provider is not configured.', toolCalls: [] };
    }

    try {
      const modelName = model || aiConfig.model || 'gemini-2.0-flash';
      const genModel = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: temperature ?? aiConfig.temperature,
        },
      });

      const geminiTools = tools && tools.length > 0 ? [{
        functionDeclarations: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      }] : undefined;

      const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => this.convertMessage(m));

      const chat = genModel.startChat({
        history: chatMessages,
        systemInstruction,
        tools: geminiTools,
      });

      const functionResponses = toolResults.map(tr => ({
        functionResponse: {
          name: tr.name,
          response: tr.result,
        },
      }));

      const result = await chat.sendMessage(functionResponses);
      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate) {
        return { text: 'I could not process the tool results. Please try again.', toolCalls: [] };
      }

      const parts = candidate.content?.parts || [];
      let text = '';
      const toolCalls = [];

      for (const part of parts) {
        if (part.text) text += part.text;
        if (part.functionCall) {
          toolCalls.push({
            type: 'tool_call',
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          });
        }
      }

      return { text, toolCalls };
    } catch (error) {
      logger.error('Gemini tool results error', { error: error.message });
      throw new Error(`AI provider error: ${error.message}`);
    }
  }

  convertMessage(msg) {
    if (msg.role === 'user') {
      return { role: 'user', parts: [{ text: msg.content }] };
    } else if (msg.role === 'assistant') {
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        const parts = [];
        if (msg.content) parts.push({ text: msg.content });
        msg.toolCalls.forEach(tc => {
          parts.push({ functionCall: { name: tc.name, args: tc.arguments } });
        });
        return { role: 'model', parts };
      }
      return { role: 'model', parts: [{ text: msg.content || '' }] };
    } else if (msg.role === 'tool') {
      let parsed = {};
      try {
        parsed = JSON.parse(msg.content);
      } catch {
        parsed = { content: msg.content };
      }
      return {
        role: 'function',
        parts: [{
          functionResponse: {
            name: msg.toolName,
            response: parsed,
          },
        }],
      };
    }
    return { role: 'user', parts: [{ text: msg.content || '' }] };
  }
}

