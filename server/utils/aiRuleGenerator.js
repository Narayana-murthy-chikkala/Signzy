// Rule-based (regex-driven) natural-language -> routing-config translator.
// Deliberately does not call any external LLM API: the goal is to turn a
// constrained sentence pattern into structured JSON, not general NLU.
const UNIT_TO_MS = {
  ms: 1,
  millisecond: 1,
  milliseconds: 1,
  s: 1000,
  sec: 1000,
  secs: 1000,
  second: 1000,
  seconds: 1000,
};

const toMs = (value, unit) => {
  const factor = UNIT_TO_MS[(unit || 'ms').toLowerCase()] || 1;
  return Number(value) * factor;
};

const extractWeights = (text) => {
  const weights = [];
  // Anchors each match to a clause boundary (start of string, comma, or "and")
  // so the captured vendor name can't bleed backwards into earlier words.
  const regex = /(?:^|,|\band\b)\s*(?:use\s+)?(Vendor\s+\w+|\w+)\s+for\s+(\d{1,3})\s*%/gi;
  let match = regex.exec(text);

  while (match) {
    weights.push({ vendor: match[1].trim(), percentage: Number(match[2]) });
    match = regex.exec(text);
  }

  return weights;
};

// Operator words/phrases that all mean "greater than" - the generator only
// ever produces the ">" operator, but accepts any of these synonyms as input.
const OPERATOR_SYNONYMS = 'exceeds|crosses|goes above|rises above|is above|is greater than|>';

const CLAUSE_REGEX = new RegExp(
  `(latency|error rate|errors?|cost)\\s+(?:${OPERATOR_SYNONYMS})\\s+(\\d+(?:\\.\\d+)?)\\s*(ms|milliseconds|millisecond|s|sec|secs|second|seconds|%)?`,
  'gi'
);

// Finds every "switch to VENDOR if ..." trigger, then within its clause text
// extracts *all* metric conditions joined by and/or (e.g. "latency crosses 2s
// or error rate is above 5%" produces two separate condition objects that
// both point at the same fallback vendor).
const extractConditions = (text) => {
  const conditions = [];
  const triggerRegex = /switch\s+to\s+([A-Za-z][A-Za-z0-9 _-]*?)\s+if\s+([^.]+)/gi;
  let triggerMatch = triggerRegex.exec(text);

  while (triggerMatch) {
    const vendor = triggerMatch[1].trim();
    const clauseText = triggerMatch[2];

    CLAUSE_REGEX.lastIndex = 0;
    let clauseMatch = CLAUSE_REGEX.exec(clauseText);
    while (clauseMatch) {
      const [, rawMetric, rawValue, unit] = clauseMatch;
      const metric = rawMetric.toLowerCase().startsWith('latency')
        ? 'latency'
        : rawMetric.toLowerCase().startsWith('cost')
        ? 'cost'
        : 'errorRate';

      conditions.push({
        metric,
        operator: '>',
        value: metric === 'latency' ? toMs(rawValue, unit) : Number(rawValue),
        unit: metric === 'latency' ? 'ms' : unit === '%' ? '%' : 'value',
        action: 'switchTo',
        vendor,
      });

      clauseMatch = CLAUSE_REGEX.exec(clauseText);
    }

    triggerMatch = triggerRegex.exec(text);
  }

  return conditions;
};

const detectKeywordStrategy = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('round robin')) return 'roundRobin';
  if (lower.includes('lowest cost') || lower.includes('cheapest')) return 'lowestCost';
  if (lower.includes('lowest latency') || lower.includes('fastest')) return 'lowestLatency';
  if (lower.includes('failover') || lower.includes('backup vendor')) return 'failover';
  if (lower.includes('feature')) return 'featureBased';
  if (lower.includes('health')) return 'healthBased';
  if (lower.includes('priorit')) return 'priority';
  return null;
};

// Falls back to scanning for generic "Vendor X" style mentions, in the order
// they appear, when no percentages were found (e.g. plain priority ordering).
const extractGenericVendorOrder = (text) => {
  const regex = /\bVendor\s+[A-Za-z0-9]+\b/gi;
  return Array.from(new Set((text.match(regex) || []).map((v) => v.trim())));
};

const generateRoutingConfig = (naturalLanguageText) => {
  if (!naturalLanguageText || !naturalLanguageText.trim()) {
    throw new Error('Rule text is required');
  }

  const weights = extractWeights(naturalLanguageText);
  const conditions = extractConditions(naturalLanguageText);
  const keywordStrategy = detectKeywordStrategy(naturalLanguageText);

  let strategy;
  let weightConfig = null;

  if (weights.length > 0) {
    strategy = 'weighted';
    weightConfig = weights;
  } else if (keywordStrategy) {
    strategy = keywordStrategy;
  } else {
    strategy = 'priority';
  }

  const vendorOrder =
    weights.length > 0 ? weights.map((w) => w.vendor) : extractGenericVendorOrder(naturalLanguageText);

  return {
    strategy,
    vendorOrder,
    weights: weightConfig,
    conditions,
    sourceText: naturalLanguageText,
  };
};

module.exports = { generateRoutingConfig };
