// Comprehensive polyfills for Mesh SDK
import { Buffer } from 'buffer';
import process from 'process';

// Ensure Buffer is available globally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

if (typeof globalThis.process === 'undefined') {
  globalThis.process = process;
}

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

// For browser environments
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  (window as any).global = globalThis;
}

// For Node.js environments
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
  (global as any).process = process;
}

// Additional polyfills that might be needed
if (typeof globalThis.crypto === 'undefined') {
  // Use a simple crypto polyfill if needed
  globalThis.crypto = {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  } as any;
}

export { Buffer, process };
