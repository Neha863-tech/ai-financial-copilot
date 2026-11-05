import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(ApiResponse.created('User registered successfully', { user }));
  }),

  login: asyncHandler(async (req, res) => {
    const { token, user } = await authService.login(req.body);
    setTokenCookie(res, token);
    res.status(200).json(ApiResponse.success('Login successful', { user, token }));
  }),

  logout: asyncHandler(async (req, res) => {
    clearTokenCookie(res);
    res.status(200).json(ApiResponse.success('Logged out successfully'));
  }),

  getMe: asyncHandler(async (req, res) => {
    res.status(200).json(ApiResponse.success('Current user profile', { user: req.user }));
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Profile updated successfully', { user }));
  }),
};

