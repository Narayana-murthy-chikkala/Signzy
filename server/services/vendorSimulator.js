const { SIM_SUCCESS_RATE, SIM_FAILURE_RATE, SIM_TIMEOUT_RATE, DEFAULT_TIMEOUT_MS } = require('../config/constants');
const { buildCapabilityResponse } = require('../utils/capabilityResponses');

const randomLatency = () => Math.floor(Math.random() * (3000 - 100 + 1)) + 100;

// Normalized so the three env-configured rates don't have to add up to
// exactly 100 to behave correctly - if they're edited independently, outcome
// probabilities stay proportional instead of silently drifting.
const OUTCOME_TOTAL = SIM_SUCCESS_RATE + SIM_FAILURE_RATE + SIM_TIMEOUT_RATE;

// Picks success / failure / timeout using the configured probabilities.
const rollOutcome = () => {
  const roll = Math.random() * OUTCOME_TOTAL;
  if (roll < SIM_SUCCESS_RATE) return 'success';
  if (roll < SIM_SUCCESS_RATE + SIM_FAILURE_RATE) return 'failure';
  return 'timeout';
};

// Simulates calling a vendor. No real vendor APIs are ever contacted -
// outcome and latency are randomized to exercise the routing/failover logic.
// The response shape on success is capability-specific (see
// utils/capabilityResponses.js) - a PAN_VERIFICATION call gets back
// { panStatus, nameMatch }, an SMS call gets back a delivery receipt, etc.
const callVendor = (vendor, payload, capability) =>
  new Promise((resolve) => {
    const latency = randomLatency();
    const outcome = rollOutcome();
    const effectiveTimeout = vendor.timeoutMs || DEFAULT_TIMEOUT_MS;
    const willTimeout = outcome === 'timeout' || latency > effectiveTimeout;
    const settleAfter = Math.min(latency, effectiveTimeout);

    setTimeout(() => {
      if (willTimeout) {
        resolve({
          success: false,
          status: 'timeout',
          latency: effectiveTimeout,
          reason: `Vendor timed out after ${effectiveTimeout}ms`,
        });
        return;
      }

      if (outcome === 'failure') {
        resolve({
          success: false,
          status: 'failure',
          latency,
          reason: 'Vendor returned a failure response',
        });
        return;
      }

      resolve({
        success: true,
        status: 'success',
        latency,
        reason: 'Vendor processed the request successfully',
        response: buildCapabilityResponse(capability, vendor.name, payload),
      });
    }, settleAfter);
  });

module.exports = { callVendor };
