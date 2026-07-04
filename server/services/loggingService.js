const RoutingLog = require('../models/RoutingLog');
const { appendRoutingLog } = require('../utils/fileLogger');

// Persists a routing decision to MongoDB (for the searchable /routing-logs API)
// and to the flat-file audit log under server/logs/.
const createRoutingLog = async (logData) => {
  const log = await RoutingLog.create(logData);
  appendRoutingLog(logData);
  return log;
};

module.exports = { createRoutingLog };
