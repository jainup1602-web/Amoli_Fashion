/**
 * Structured Logger for Amoli Backend
 * Handles error logs, failed login logs, and payment failure logs.
 * Logs to both console and file system.
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create log directory:', err.message);
}

/**
 * Format a log entry with timestamp and metadata
 */
function formatEntry(level, category, message, data = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    ...data,
  }) + '\n';
}

/**
 * Append log to a file
 */
function appendToFile(filename, entry) {
  try {
    const filePath = path.join(LOG_DIR, filename);
    fs.appendFileSync(filePath, entry);
  } catch (err) {
    console.error(`Failed to write to ${filename}:`, err.message);
  }
}

const logger = {
  /**
   * General info log
   */
  info(message, data = {}) {
    const entry = formatEntry('INFO', 'general', message, data);
    console.log(`ℹ️  ${message}`, Object.keys(data).length ? data : '');
  },

  /**
   * Error log — saved to error.log
   */
  error(message, error = null, data = {}) {
    const entry = formatEntry('ERROR', 'error', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...data,
    });
    console.error(`❌ ${message}`, error?.message || '');
    appendToFile('error.log', entry);
  },

  /**
   * Failed login attempt — saved to failed-logins.log
   */
  failedLogin(ip, email, reason, data = {}) {
    const entry = formatEntry('WARN', 'auth', 'Failed login attempt', {
      ip,
      email,
      reason,
      ...data,
    });
    console.warn(`🔒 Failed login: ${email} from ${ip} — ${reason}`);
    appendToFile('failed-logins.log', entry);
  },

  /**
   * Payment failure — saved to payment-failures.log
   */
  paymentFailure(orderId, amount, reason, data = {}) {
    const entry = formatEntry('ERROR', 'payment', 'Payment failure', {
      orderId,
      amount,
      reason,
      ...data,
    });
    console.error(`💳 Payment failure: Order ${orderId} — ${reason}`);
    appendToFile('payment-failures.log', entry);
  },

  /**
   * Security event — saved to security.log
   */
  security(event, ip, data = {}) {
    const entry = formatEntry('WARN', 'security', event, {
      ip,
      ...data,
    });
    console.warn(`🛡️  Security: ${event} from ${ip}`);
    appendToFile('security.log', entry);
  },

  /**
   * Admin action log — saved to admin-actions.log
   */
  adminAction(adminId, action, details = {}) {
    const entry = formatEntry('INFO', 'admin', action, {
      adminId,
      ...details,
    });
    appendToFile('admin-actions.log', entry);
  },
};

/**
 * Express middleware: Log failed authentication attempts
 */
function logFailedAuth(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (res.statusCode === 401 && req.path.includes('/auth')) {
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const email = req.body?.email || 'unknown';
      logger.failedLogin(ip, email, body?.message || 'Unknown reason');
    }
    return originalJson(body);
  };

  next();
}

/**
 * Express middleware: Log all errors
 */
function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.path} — ${err.message}`, err, {
    ip: req.ip,
    userId: req.user?.id,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

module.exports = { logger, logFailedAuth, errorHandler };
