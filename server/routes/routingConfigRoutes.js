const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { createRoutingConfig, getRoutingConfigs } = require('../controllers/routingConfigController');

const router = express.Router();

router.route('/').post(asyncHandler(createRoutingConfig)).get(asyncHandler(getRoutingConfigs));

module.exports = router;
