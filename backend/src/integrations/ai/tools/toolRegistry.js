import { spendingTools } from './spending.tools.js';
import { budgetTools } from './budget.tools.js';
import { recurringTools } from './recurring.tools.js';
import { simulatorTools } from './simulator.tools.js';

const TOOL_REGISTRY = new Map();

function registerTools(tools) {
  for (const tool of tools) {
    TOOL_REGISTRY.set(tool.name, tool);
  }
}

registerTools(spendingTools);
registerTools(budgetTools);
registerTools(recurringTools);
registerTools(simulatorTools);

export const toolRegistry = {
  getAllTools() {
    return Array.from(TOOL_REGISTRY.values());
  },

  getToolDefinitions() {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  },

  getTool(name) {
    return TOOL_REGISTRY.get(name);
  },

  isAllowed(name) {
    return TOOL_REGISTRY.has(name);
  },

  async executeTool(name, args, userId) {
    const tool = TOOL_REGISTRY.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered`);
    }
    return tool.execute({ ...args, userId });
  },
};

