import { aiConfig } from '../../../config/ai.js';
import { AIProvider } from '../aiProvider.js';
import { logger } from '../../../utils/logger.js';

export class GroqProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.GROQ_API_KEY || (aiConfig.provider === 'groq' ? aiConfig.apiKey : null);
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async generateResponse({ messages, tools, model, temperature }) {
    if (!this.apiKey || this.apiKey === 'replace_me') {
      return {
        text: 'Groq API key is not configured. Please add GROQ_API_KEY or AI_API_KEY in backend .env, or use the FinSight built-in reasoning engine.',
        toolCalls: [],
      };
    }

    try {
      const modelName = model || (aiConfig.provider === 'groq' && aiConfig.model ? aiConfig.model : 'llama-3.3-70b-versatile');
      const groqTools = tools && tools.length > 0 ? tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })) : undefined;

      const groqMessages = messages.map(m => {
        if (m.role === 'tool') {
          return {
            role: 'tool',
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
            name: m.toolName,
          };
        }
        return {
          role: m.role === 'model' ? 'assistant' : m.role,
          content: m.content || '',
        };
      });

      const payload = {
        model: modelName,
        messages: groqMessages,
        temperature: temperature ?? 0.2,
      };

      if (groqTools && groqTools.length > 0) {
        payload.tools = groqTools;
        payload.tool_choice = 'auto';
      }

      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      if (!choice || !choice.message) {
        return { text: 'No response generated from Groq.', toolCalls: [] };
      }

      const toolCalls = (choice.message.tool_calls || []).map(tc => {
        let args = {};
        try {
          args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        } catch {
          args = {};
        }
        return {
          type: 'tool_call',
          name: tc.function.name,
          arguments: args,
        };
      });

      return {
        text: choice.message.content || '',
        toolCalls,
      };
    } catch (error) {
      logger.error('Groq API error:', { error: error.message });
      throw new Error(`Groq AI error: ${error.message}`);
    }
  }

  async sendToolResults(messages, tools, toolResults, model, temperature) {
    if (!this.apiKey) {
      return { text: 'Groq API key is not configured.', toolCalls: [] };
    }

    try {
      const modelName = model || 'llama-3.3-70b-versatile';
      const groqMessages = [...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content || '',
      }))];

      for (const tr of toolResults) {
        groqMessages.push({
          role: 'tool',
          content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
          name: tr.name,
        });
      }

      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: groqMessages,
          temperature: temperature ?? 0.2,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq tool response error: ${errText}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      return {
        text: choice?.message?.content || '',
        toolCalls: [],
      };
    } catch (error) {
      logger.error('Groq tool execution follow-up error', { error: error.message });
      throw new Error(`Groq AI follow-up error: ${error.message}`);
    }
  }
}
