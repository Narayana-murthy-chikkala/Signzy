const Vendor = require('../models/Vendor');
const { HIGH_ERROR_RATE_THRESHOLD, MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK } = require('../config/constants');

// Updates a vendor's rolling metrics after a real attempt (skipped vendors
// during filtering do not go through here; availabilityPercentage is tracked
// separately in utils/availabilityTracker.js). The request-count fields are
// bumped with an atomic $inc so concurrent attempts against the same vendor
// can't lose an increment; the derived rates are then recomputed from the
// fresh counts.
const recordAttempt = async (vendor, { success, latency }) => {
  const increments = success
    ? { 'metrics.totalRequests': 1, 'metrics.successfulRequests': 1 }
    : { 'metrics.totalRequests': 1, 'metrics.failedRequests': 1 };

  const updated = await Vendor.findByIdAndUpdate(vendor._id, { $inc: increments }, { returnDocument: 'after' });
  if (!updated) return;

  const m = updated.metrics;
  // m.averageLatency here is still the pre-update average - the $inc above
  // never touched it - so this reproduces the standard running-average formula.
  m.averageLatency = Math.round((m.averageLatency * (m.totalRequests - 1) + latency) / m.totalRequests);
  m.successRate = Number(((m.successfulRequests / m.totalRequests) * 100).toFixed(2));
  m.errorRate = Number(((m.failedRequests / m.totalRequests) * 100).toFixed(2));
  m.lastUsedTime = new Date();

  updated.currentLatency = latency;

  // Auto-circuit-break: a sustained high error rate flips the vendor
  // unhealthy, which excludes it from future routing via filterVendors.js.
  // There's no auto-recovery - once tripped it stays excluded (so it can't
  // accumulate new attempts to self-heal), matching a circuit breaker's
  // "open" state. An admin can manually mark it healthy again in Vendor
  // Management.
  if (
    updated.healthStatus === 'healthy' &&
    m.totalRequests >= MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK &&
    m.errorRate > HIGH_ERROR_RATE_THRESHOLD
  ) {
    updated.healthStatus = 'unhealthy';
  }

  await updated.save();

  // Reflect the fresh values onto the in-memory vendor object the caller
  // (routingEngine) is already holding for the rest of this request.
  vendor.metrics = updated.metrics;
  vendor.currentLatency = updated.currentLatency;
  vendor.healthStatus = updated.healthStatus;
};

module.exports = { recordAttempt };
