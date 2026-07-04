const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { route } = require('../controllers/routingController');

const router = express.Router();

router.post('/', asyncHandler(route));

module.exports = router;
