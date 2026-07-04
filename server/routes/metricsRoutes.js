const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getVendorMetrics } = require('../controllers/metricsController');

const router = express.Router();

router.get('/', asyncHandler(getVendorMetrics));

module.exports = router;
