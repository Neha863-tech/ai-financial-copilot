import { reportsService } from '../services/reports.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportsController = {
  getHistorical: asyncHandler(async (req, res) => {
    const report = await reportsService.getHistoricalReport(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Historical financial report generated', report));
  }),

  getCurrent: asyncHandler(async (req, res) => {
    const overview = await reportsService.getCurrentOverview(req.user.id);
    res.status(200).json(ApiResponse.success('Current financial overview retrieved', overview));
  }),

  getForecast: asyncHandler(async (req, res) => {
    const forecast = await reportsService.getFutureForecast(req.user.id);
    res.status(200).json(ApiResponse.success('Future schedule and forecast generated', forecast));
  }),

  exportCSV: asyncHandler(async (req, res) => {
    const csvData = await reportsService.exportReportCSV(req.user.id, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="FinSight_Financial_Report_${Date.now()}.csv"`);
    res.status(200).send(csvData);
  }),
};
