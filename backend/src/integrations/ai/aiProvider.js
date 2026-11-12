export class AIProvider {
  async generateResponse({ messages, tools, model, temperature }) {
    throw new Error('generateResponse must be implemented by provider');
  }

  async sendToolResults(messages, tools, toolResults, model, temperature) {
    throw new Error('sendToolResults must be implemented by provider');
  }
}

