// api/index.js
// Wrap the RSSHub Hono app so it can run on Vercel as a Node serverless function.
import app from '../lib/app';
import { handle } from 'hono/vercel';

// Export a Vercel-compatible handler for Node runtime
export default handle(app);


