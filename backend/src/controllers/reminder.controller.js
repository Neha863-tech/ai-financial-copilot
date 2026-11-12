import { reminderService } from '../services/reminder.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reminderController = {
  list: asyncHandler(async (req, res) => {
    const reminders = await reminderService.list(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Reminders retrieved', { reminders }));
  }),

  create: asyncHandler(async (req, res) => {
    const reminder = await reminderService.create(req.user.id, req.body);
    res.status(201).json(ApiResponse.created('Reminder created successfully', { reminder }));
  }),

  update: asyncHandler(async (req, res) => {
    const reminder = await reminderService.update(req.user.id, req.params.id, req.body);
    res.status(200).json(ApiResponse.success('Reminder updated successfully', { reminder }));
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await reminderService.delete(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};

