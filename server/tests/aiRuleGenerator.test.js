const { generateRoutingConfig } = require('../utils/aiRuleGenerator');

describe('generateRoutingConfig', () => {
  it('parses the canonical brief example into weights + a latency condition', () => {
    const text = 'Use Vendor A for 70% traffic and Vendor B for 30%, but switch to Vendor C if latency exceeds 2 seconds.';
    const config = generateRoutingConfig(text);

    expect(config.strategy).toBe('weighted');
    expect(config.weights).toEqual([
      { vendor: 'Vendor A', percentage: 70 },
      { vendor: 'Vendor B', percentage: 30 },
    ]);
    expect(config.conditions).toEqual([
      { metric: 'latency', operator: '>', value: 2000, unit: 'ms', action: 'switchTo', vendor: 'Vendor C' },
    ]);
  });

  it('parses the exact assignment-brief example: comma-separated weights, "crosses", and a compound and/or condition', () => {
    const text =
      'Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%.';
    const config = generateRoutingConfig(text);

    expect(config.strategy).toBe('weighted');
    expect(config.weights).toEqual([
      { vendor: 'Vendor A', percentage: 70 },
      { vendor: 'Vendor B', percentage: 30 },
    ]);
    expect(config.conditions).toEqual([
      { metric: 'latency', operator: '>', value: 2000, unit: 'ms', action: 'switchTo', vendor: 'Vendor C' },
      { metric: 'errorRate', operator: '>', value: 5, unit: '%', action: 'switchTo', vendor: 'Vendor C' },
    ]);
  });

  it('falls back to a keyword strategy when no percentages are present', () => {
    const config = generateRoutingConfig('Always prefer the vendor with the lowest cost.');
    expect(config.strategy).toBe('lowestCost');
    expect(config.weights).toBeNull();
  });

  it('throws on empty input', () => {
    expect(() => generateRoutingConfig('   ')).toThrow();
  });
});
