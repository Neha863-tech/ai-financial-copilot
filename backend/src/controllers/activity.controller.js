import { activityService } from '../services/activity.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const activityController = {
  getActivities: asyncHandler(async (req, res) => {
    const { category, search, startDate, endDate, page, limit } = req.query;
    const result = await activityService.getActivityTimeline(req.user.id, {
      category,
      search,
      startDate,
      endDate,
      page,
      limit,
    });
    res.status(200).json(ApiResponse.success('Activity timeline retrieved', result));
  }),

  exportActivities: asyncHandler(async (req, res) => {
    const csvData = await activityService.exportActivityCsv(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="finsight-activities-${req.user.id}.csv"`);
    res.status(200).send(csvData);
  }),

  getAuditLogs: asyncHandler(async (req, res) => {
    const { riskLevel, outcome, search, page, limit } = req.query;
    const result = await activityService.getAuditLogs(req.user.id, {
      riskLevel,
      outcome,
      search,
      page,
      limit,
    });
    res.status(200).json(ApiResponse.success('Security audit logs retrieved', result));
  }),
};
