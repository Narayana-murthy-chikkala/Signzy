const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getStrategyRecommendation, getFallbackSuggestions } = require('../controllers/adviceController');

const router = express.Router();

router.get('/strategy-recommendation', asyncHandler(getStrategyRecommendation));
router.get('/fallback-suggestions', asyncHandler(getFallbackSuggestions));

module.exports = router;
