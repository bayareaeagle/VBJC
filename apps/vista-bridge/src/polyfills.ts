// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make polyfills available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  (window as any).global = globalThis;
}

// Make polyfills available on globalThis
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

if (typeof globalThis.process === 'undefined') {
  globalThis.process = process;
}

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// Also make them available on the global object
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
  (global as any).process = process;
}

// Ensure Buffer is available in all contexts
if (typeof Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Make sure process is available
if (typeof process === 'undefined') {
  (globalThis as any).process = process;
}

export { Buffer, process };
