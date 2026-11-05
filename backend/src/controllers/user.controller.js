import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json(ApiResponse.success('User retrieved', { user }));
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Profile updated', { user }));
  }),
};

