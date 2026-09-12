// Cloudflare Worker entry point
// This file contains Worker-specific initialization and polyfills

// Initialize request-rewriter (sets up fetch wrapper with proper headers)
import '@/utils/request-rewriter';

// Import and re-export the main app
// Worker-specific module replacements are handled by tsdown aliases
export { default } from './app.worker';
