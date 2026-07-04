const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { generateRule } = require('../controllers/aiRuleController');

const router = express.Router();

router.post('/', asyncHandler(generateRule));

module.exports = router;
