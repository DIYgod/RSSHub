const devApiImpl = require('./developer-api/search');
const webApiImpl = require('./web-api/search');
const apiFallback = require('./api_fallback_common');

module.exports = (ctx) => apiFallback(ctx, devApiImpl, webApiImpl);
