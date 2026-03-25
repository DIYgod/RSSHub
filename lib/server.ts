// This file is for compatibility with Vercel's deployment.

import '@/utils/request-rewriter';

export default (await import('./app-bootstrap')).default;
