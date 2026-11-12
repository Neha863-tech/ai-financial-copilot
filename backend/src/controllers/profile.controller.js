import { profileService } from '../services/profile.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getClientIp, parseUserAgent, getApproximateLocation } from '../utils/deviceParser.js';

function extractReqMeta(req) {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const parsed = parseUserAgent(userAgent);
  const location = getApproximateLocation(ipAddress);
  return {
    ipAddress,
    userAgent,
    location,
    sessionTokenHash: req.sessionTokenHash,
    ...parsed,
  };
}

export const profileController = {
  getProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json(ApiResponse.success('User profile retrieved successfully', profile));
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const updated = await profileService.updateProfile(req.user.id, req.body, meta);
    res.status(200).json(ApiResponse.success('Profile updated successfully', { user: updated }));
  }),

  updateAvatar: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const updated = await profileService.updateAvatar(req.user.id, req.body.avatarUrl, meta);
    res.status(200).json(ApiResponse.success('Avatar updated successfully', { user: updated }));
  }),

  changePassword: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const result = await profileService.changePassword(req.user.id, req.body, meta);
    res.status(200).json(ApiResponse.success(result.message));
  }),

  getNotificationPreferences: asyncHandler(async (req, res) => {
    const preferences = await profileService.getNotificationPreferences(req.user.id);
    res.status(200).json(ApiResponse.success('Notification preferences retrieved', { preferences }));
  }),

  updateNotificationPreferences: asyncHandler(async (req, res) => {
    const preferences = await profileService.updateNotificationPreferences(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Notification preferences updated', { preferences }));
  }),

  exportUserData: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const exportData = await profileService.exportUserData(req.user.id, meta);
    res.setHeader('Content-Disposition', `attachment; filename="finsight-data-export-${req.user.id}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(exportData, null, 2));
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const result = await profileService.deleteAccount(req.user.id, req.body, meta);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};
