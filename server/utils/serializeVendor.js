const { computeAvailability } = require('./computeAvailability');

// Converts a Vendor document to a plain object with metrics.availabilityPercentage
// injected live (see computeAvailability.js) - it's intentionally never stored,
// so every response has to attach it fresh.
const serializeVendor = (vendorDoc) => {
  const obj = typeof vendorDoc.toObject === 'function' ? vendorDoc.toObject() : { ...vendorDoc };
  obj.metrics = { ...obj.metrics, availabilityPercentage: computeAvailability(obj) };
  return obj;
};

const serializeVendors = (vendorDocs) => vendorDocs.map(serializeVendor);

module.exports = { serializeVendor, serializeVendors };
