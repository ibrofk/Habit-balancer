// Advanced Logging Utility

class Logger {
  constructor(context) {
    this.context = context;
    this.logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
  }

  // Log levels
  static LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  // Centralized logging method
  _log(level, message, metadata = {}) {
    // Only log if the current log level allows
    if (Logger.LEVELS[level] <= Logger.LEVELS[this.logLevel]) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        context: this.context,
        message,
        metadata
      };

      // Console logging
      console[level](`[${this.context}] ${message}`, metadata);

      // Optional: Send to external logging service
      this._sendToLogService(logEntry);
    }
  }

  // Method to send logs to external service (placeholder)
  _sendToLogService(logEntry) {
    // Implement integration with logging services like Sentry, LogRocket, etc.
    if (window.Sentry) {
      if (logEntry.level === 'error') {
        window.Sentry.captureException(new Error(logEntry.message));
      }
    }
  }

  // Public logging methods
  error(message, metadata = {}) {
    this._log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    this._log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    this._log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    this._log('debug', message, metadata);
  }

  // Performance tracking
  time(label) {
    console.time(`[${this.context}] ${label}`);
  }

  timeEnd(label) {
    console.timeEnd(`[${this.context}] ${label}`);
  }

  // Audit logging for critical actions
  audit(action, details = {}) {
    const auditLog = {
      action,
      timestamp: new Date().toISOString(),
      ...details
    };

    // Log to console
    this.info(`AUDIT: ${action}`, auditLog);

    // Optional: Store in database or send to audit service
    this._storeAuditLog(auditLog);
  }

  // Method to store audit logs (placeholder)
  _storeAuditLog(auditLog) {
    // Implement audit log storage
    // Could be Firebase, external service, or local storage
  }
}

// Factory method to create loggers
Logger.create = (context) => {
  return new Logger(context);
};

export default Logger;

// Example usage
export const userLogger = Logger.create('UserService');
export const taskLogger = Logger.create('TaskService');
export const shopLogger = Logger.create('ShopService');
