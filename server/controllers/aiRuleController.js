const ApiError = require('../utils/ApiError');
const { generateRoutingConfig } = require('../utils/aiRuleGenerator');

// POST /ai-rule-generator
const generateRule = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, '"text" is required');
  }

  const config = generateRoutingConfig(text);
  res.status(200).json({ success: true, data: config });
};

module.exports = { generateRule };
