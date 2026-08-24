const { logger } = require('./logger');

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
    this.stats = { total: 0, success: 0, failure: 0, rejected: 0 };
  }

  async execute(fn, fallbackFn) {
    this.stats.total++;
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
      } else {
        this.stats.rejected++;
        if (fallbackFn) return fallbackFn();
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }
    if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.halfOpenMaxCalls) {
      this.stats.rejected++;
      if (fallbackFn) return fallbackFn();
      throw new Error(`Circuit breaker ${this.name} HALF_OPEN limit reached`);
    }
    if (this.state === 'HALF_OPEN') this.halfOpenCalls++;
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallbackFn) return fallbackFn();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.halfOpenCalls = 0;
      logger.info(`Circuit breaker ${this.name} closed`);
    }
    this.stats.success++;
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.stats.failure++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker ${this.name} opened after ${this.failures} failures`);
    }
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failures, stats: this.stats, lastFailureTime: this.lastFailureTime };
  }
}

const breakers = new Map();
const getBreaker = (name, options) => {
  if (!breakers.has(name)) breakers.set(name, new CircuitBreaker(name, options));
  return breakers.get(name);
};

module.exports = { CircuitBreaker, getBreaker };
