import { createMiddleware } from '@reduxjs/toolkit';

// Custom error handling middleware
export const errorMiddleware = createMiddleware((api) => (next) => (action) => {
  try {
    // Log all actions for debugging
    console.log('Dispatching:', action);

    // Check for specific error patterns
    if (action.type.endsWith('/rejected')) {
      // Custom error handling
      const errorMessage = action.payload || 'An unexpected error occurred';
      
      // Log error details
      console.error(`Action Error: ${action.type}`, {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      // Optional: Send error to monitoring service
      // sendErrorToMonitoringService(errorMessage);

      // Optional: Show user-friendly notification
      // showNotification(errorMessage);
    }

    return next(action);
  } catch (err) {
    console.error('Middleware Error:', err);
    return next(action);
  }
});

// Optional: Error tracking service integration
function sendErrorToMonitoringService(error) {
  // Implement error tracking (e.g., Sentry, LogRocket)
  // This is a placeholder for actual implementation
  if (window.Sentry) {
    window.Sentry.captureException(error);
  }
}

// Optional: Notification system
function showNotification(message) {
  // Implement toast or notification system
  // This could integrate with a UI library like react-toastify
  if (window.toast) {
    window.toast.error(message);
  }
}
