import { savingsSimulatorService } from '../services/savingsSimulator.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const simulatorController = {
  simulate: asyncHandler(async (req, res) => {
    const simulation = await savingsSimulatorService.simulate(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Savings simulation calculated', { simulation }));
  }),
};

