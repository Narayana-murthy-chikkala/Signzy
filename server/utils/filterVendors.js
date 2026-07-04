const { LATENCY_THRESHOLD_MS } = require('../config/constants');
const { isRateLimited } = require('./rateLimiter');
const { recordAvailabilityCheck } = require('./availabilityTracker');

// Reasons that count against a vendor's availability metric (it wasn't usable
// at all). "missing feature" is deliberately excluded - that's a capability
// mismatch, not a vendor health/availability issue.
const AVAILABILITY_REASONS = new Set(['down', 'unhealthy', 'rate-limited', 'high-latency']);

const classify = (vendor, capability, latencyThreshold) => {
  if (!vendor.isActive) return { reason: 'down', message: 'Vendor is down' };
  if (vendor.healthStatus !== 'healthy') return { reason: 'unhealthy', message: 'Vendor is unhealthy' };
  if (isRateLimited(vendor)) return { reason: 'rate-limited', message: 'Vendor rate limit exceeded' };
  if (capability && !vendor.supportedFeatures.includes(capability)) {
    return { reason: 'missing-feature', message: `Vendor does not support capability "${capability}"` };
  }
  if (vendor.currentLatency > latencyThreshold) {
    return { reason: 'high-latency', message: `Vendor exceeds latency threshold (${latencyThreshold}ms)` };
  }
  return null;
};

// Applies all of the "ignore this vendor" rules from the spec and returns
// both the vendors still eligible for routing and the ones skipped (with why),
// so the caller can surface skip reasons in failoverHistory/logs.
//
// `maxLatencyMs`, when provided (from a request's `requirements` object),
// overrides the global LATENCY_THRESHOLD_MS for just this call.
const getEligibleVendors = async (vendors, capability, maxLatencyMs) => {
  const latencyThreshold = typeof maxLatencyMs === 'number' ? maxLatencyMs : LATENCY_THRESHOLD_MS;
  const eligible = [];
  const skipped = [];

  for (const vendor of vendors) {
    const skip = classify(vendor, capability, latencyThreshold);
    await recordAvailabilityCheck(vendor, { unavailable: skip ? AVAILABILITY_REASONS.has(skip.reason) : false });

    if (skip) {
      skipped.push({ vendor: vendor.name, reason: skip.message, status: 'skipped' });
      continue;
    }

    eligible.push(vendor);
  }

  return { eligible, skipped };
};

module.exports = { getEligibleVendors };
