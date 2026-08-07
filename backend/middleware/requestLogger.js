const requestLogger = (req, res, next) => {
  // Store request start time
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    };

    // Color code based on status
    let color = '\x1b[32m'; // Green for 2xx
    if (res.statusCode >= 400 && res.statusCode < 500) {
      color = '\x1b[33m'; // Yellow for 4xx
    } else if (res.statusCode >= 500) {
      color = '\x1b[31m'; // Red for 5xx
    }

    console.log(
      `${color}[${logData.timestamp}] ${logData.method} ${logData.url} - Status: ${logData.statusCode} - Duration: ${logData.duration}\x1b[0m`
    );

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = requestLogger;