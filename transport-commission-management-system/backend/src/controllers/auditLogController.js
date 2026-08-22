import * as auditLogService from "../services/auditLogService.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditLogService.getAuditLogs(req.query);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
