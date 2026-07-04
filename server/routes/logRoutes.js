const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getRoutingLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', asyncHandler(getRoutingLogs));

module.exports = router;
