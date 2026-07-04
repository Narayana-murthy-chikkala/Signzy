const { routeRequest } = require('../services/routingEngine');

// Fields that reveal which vendor handled the request or how it was picked -
// withheld from callers identifying as the end client (see `x-role` below),
// matching the brief: "the client should not know which vendor was used".
const VENDOR_IDENTIFYING_FIELDS = ['vendorUsed', 'routingReason', 'failoverHistory'];

// POST /route
// `strategy` is optional - routeRequest defaults it from requirements.preferLowCost
// (or plain priority) when omitted, matching a client that only sends
// { capability, payload, requirements }.
//
// `x-role: client` (sent by the client-facing dashboard persona) gets the
// standard envelope with vendor identity stripped out; anything else
// (including no header, for backward compatibility) is treated as `admin`
// and gets the full response.
const route = async (req, res) => {
  const { capability, payload, strategy, requirements, conditions } = req.body;
  const role = String(req.headers['x-role'] || 'admin').toLowerCase();

  const result = await routeRequest({ capability, payload, strategy, requirements, conditions });

  if (role === 'client') {
    VENDOR_IDENTIFYING_FIELDS.forEach((field) => delete result[field]);
  }

  res.status(200).json({ success: true, ...result });
};

module.exports = { route };
