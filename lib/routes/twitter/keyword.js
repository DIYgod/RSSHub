const webApiImpl = require('./web-api/search');

module.exports = async (ctx) => await webApiImpl(ctx);
