// This file ensures that the request rewriter runs before the app

import '@/utils/request-rewriter';

export default (await import('./app-bootstrap')).default;
