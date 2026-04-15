'use client';

import { useEffect } from 'react';

export function DevWarningsSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (
            message.includes('Download the React DevTools') ||
            message.includes('Each child in a list should have a unique "key" prop') ||
            message.includes('has either width or height modified') ||
            message.includes('Warning: Each child in a list should have a unique "key" prop')
          )
        ) {
          return; // Suppress these development warnings
        }
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (
            message.includes('has either width or height modified') ||
            message.includes('has "fill" but is missing "sizes" prop') ||
            message.includes('Each child in a list should have a unique "key" prop')
          )
        ) {
          return; // Suppress these development warnings
        }
        originalWarn.apply(console, args);
      };

      // Also override console.log for React warnings
      const originalLog = console.log;
      console.log = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          message.includes('Each child in a list should have a unique "key" prop')
        ) {
          return; // Suppress key prop warnings
        }
        originalLog.apply(console, args);
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        console.log = originalLog;
      };
    }
  }, []);

  return null;
}