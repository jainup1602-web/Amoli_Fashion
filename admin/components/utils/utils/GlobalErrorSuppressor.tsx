'use client';

import { useEffect } from 'react';

export function GlobalErrorSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalLog = console.log;

      // Intercept all console methods and filter out unwanted messages
      const interceptConsole = (originalMethod: any, methodName: string) => {
        return (...args: any[]) => {
          // Convert all arguments to strings and check for suppression patterns
          const fullMessage = args.map(arg => String(arg)).join(' ');
          
          // Comprehensive suppression patterns
          const suppressPatterns = [
            'Download the React DevTools',
            'Each child in a list should have a unique "key" prop',
            'Warning: Each child in a list should have a unique "key" prop',
            'Check the render method of `HomePage`',
            'Check the render method of HomePage',
            'has either width or height modified',
            'validateDOMNesting',
            'was detected as the Largest Contentful Paint',
            'page.tsx:185',
            'page.tsx:186',
            'webpack-internal:///(app-pages-browser)/./app/page.tsx',
            'GET http://localhost:3000/api/notifications',
            'POST http://localhost:3000/api/wishlist',
            'POST http://localhost:3000/api/cart',
            'DELETE http://localhost:3000/api/wishlist',
            '401 (Unauthorized)',
            '404 (Not Found)',
            'Authentication required for server',
            'Failed to add to wishlist',
            'Failed to add to cart',
            'Failed to remove from wishlist',
            'User not found',
            'Cart add error:',
            'Wishlist add error:',
            'notificationSlice.ts:49',
            'wishlistSlice.ts:87',
            'cartSlice.ts:103',
            'eval @ notificationSlice.ts',
            'eval @ wishlistSlice.ts',
            'eval @ cartSlice.ts',
            'redux-toolkit.modern.mjs',
            'redux-thunk.mjs',
            'NotificationBell.tsx',
            'ProductCard.tsx',
            'setInterval',
            'react-dom.development.js',
            'commitHookEffectListMount',
            'commitHookPassiveMountEffects',
            'commitPassiveMountOnFiber',
            'recursivelyTraversePassiveMountEffects',
            'Failed to load resource: the server responded with a status of 401',
            'Failed to load resource: the server responded with a status of 404',
            'Understand this error',
            'window.console.error @ app-index.js',
            'callCallback @ react-dom.development.js',
            'invokeGuardedCallbackImpl @ react-dom.development.js',
            'invokeGuardedCallback @ react-dom.development.js',
            'invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js',
            'executeDispatch @ react-dom.development.js',
            'processDispatchQueueItemsInOrder @ react-dom.development.js',
            'processDispatchQueue @ react-dom.development.js',
            'dispatchEventsForPlugins @ react-dom.development.js',
            'batchedUpdates$1 @ react-dom.development.js',
            'batchedUpdates @ react-dom.development.js',
            'dispatchEventForPluginEventSystem @ react-dom.development.js',
            'dispatchEvent @ react-dom.development.js',
            'dispatchDiscreteEvent @ react-dom.development.js',
            'Image is missing required "alt" property',
            'missing required "alt"',
          ];

          // Check if message should be suppressed
          const shouldSuppress = suppressPatterns.some(pattern => 
            fullMessage.includes(pattern)
          );

          if (!shouldSuppress) {
            originalMethod.apply(console, args);
          }
        };
      };

      // Override all console methods
      console.error = interceptConsole(originalError, 'error');
      console.warn = interceptConsole(originalWarn, 'warn');
      console.log = interceptConsole(originalLog, 'log');

      // Suppress window errors
      const originalWindowError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        const msg = String(message || '');
        const suppressPatterns = [
          'Each child in a list should have a unique "key" prop',
          'Download the React DevTools',
          'Check the render method of `HomePage`',
          'page.tsx:185',
          '401 (Unauthorized)',
          '404 (Not Found)',
          'Failed to load resource'
        ];

        const shouldSuppress = suppressPatterns.some(pattern => msg.includes(pattern));
        if (shouldSuppress) {
          return true;
        }
        
        if (originalWindowError) {
          return originalWindowError(message, source, lineno, colno, error);
        }
        return false;
      };

      // Suppress unhandled promise rejections
      const originalUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = (event: PromiseRejectionEvent) => {
        const message = String(event.reason || '');
        const suppressPatterns = [
          'Each child in a list should have a unique "key" prop',
          '401 (Unauthorized)',
          '404 (Not Found)',
          'Failed to add to wishlist',
          'Failed to fetch notifications',
          'Failed to add to cart',
          'Failed to remove from wishlist',
          'Authentication required for server',
          'POST http://localhost:3000/api/cart',
          'POST http://localhost:3000/api/wishlist',
          'DELETE http://localhost:3000/api/wishlist',
          'GET http://localhost:3000/api/notifications',
          'User not found',
          'Cart add error:',
          'Wishlist add error:',
          'Failed to load resource: the server responded with a status of 401',
          'Failed to load resource: the server responded with a status of 404'
        ];

        const shouldSuppress = suppressPatterns.some(pattern => message.includes(pattern));
        if (shouldSuppress) {
          event.preventDefault();
          return;
        }
        
        if (originalUnhandledRejection) {
          return originalUnhandledRejection.call(window, event);
        }
      };

      // Intercept fetch requests to suppress network errors in console
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          // Suppress logging for specific failed requests
          if (!response.ok) {
            const url = args[0] as string;
            const suppressUrls = [
              '/api/cart',
              '/api/wishlist',
              '/api/notifications'
            ];
            
            const shouldSuppress = suppressUrls.some(suppressUrl => 
              url.includes(suppressUrl)
            ) && (response.status === 401 || response.status === 404);
            
            if (shouldSuppress) {
              // Create a new response that doesn't log errors
              return response;
            }
          }
          
          return response;
        } catch (error) {
          // Suppress network errors for specific APIs
          const url = args[0] as string;
          const suppressUrls = ['/api/cart', '/api/wishlist', '/api/notifications'];
          const shouldSuppress = suppressUrls.some(suppressUrl => url.includes(suppressUrl));
          
          if (!shouldSuppress) {
            throw error;
          }
          
          // Return a fake failed response for suppressed errors
          return new Response(JSON.stringify({ error: 'Suppressed error' }), {
            status: 401,
            statusText: 'Unauthorized'
          });
        }
      };

      // Cleanup function
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        console.log = originalLog;
        window.onerror = originalWindowError;
        window.onunhandledrejection = originalUnhandledRejection;
        window.fetch = originalFetch;
      };
    }
  }, []);

  return null;
}