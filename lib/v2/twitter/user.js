const devApiImpl = require('./developer-api/user');
const webApiImpl = require('./web-api/user');
const apiFallback = require('./api_fallback_common');

module.exports = (ctx) => apiFallback(ctx, devApiImpl, webApiImpl);
