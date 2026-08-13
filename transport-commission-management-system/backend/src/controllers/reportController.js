import * as reportService from "../services/reportService.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await reportService.getReports(req.query);
    res.json(reports);
  } catch (error) {
    next(error);
  }
};
