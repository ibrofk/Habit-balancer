// Performance Optimization Utilities

export class PerformanceOptimizer {
  // Memoization for expensive computations
  static memoize(fn) {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }

  // Debounce function to limit rapid function calls
  static debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  // Throttle function to limit function call rate
  static throttle(func, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Batch update optimization
  static batchUpdates(updates, batchSize = 10) {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          await Promise.all(batch.map(update => update()));
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Lazy loading utility
  static lazyLoad(importFn) {
    return React.lazy(() => {
      return new Promise((resolve) => {
        const start = performance.now();
        importFn().then((module) => {
          const end = performance.now();
          console.log(`Lazy load time: ${end - start}ms`);
          resolve(module);
        });
      });
    });
  }

  // Web Worker wrapper for CPU-intensive tasks
  static runInWebWorker(workerFunction) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(
          URL.createObjectURL(
            new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' })
          )
        );

        worker.onmessage = (event) => {
          resolve(event.data);
          worker.terminate();
        };

        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
        };

        worker.postMessage(args);
      });
    };
  }
}

// Example usage of performance optimization techniques
export const optimizedPointsCalculation = PerformanceOptimizer.memoize((tasks) => {
  return tasks.reduce((total, task) => total + (task.completed ? task.points : 0), 0);
});

export const debouncedSearch = PerformanceOptimizer.debounce((searchTerm) => {
  // Perform search operation
}, 300);
