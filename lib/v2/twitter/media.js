const webApiImpl = require('./web-api/media');

module.exports = async (ctx) => await webApiImpl(ctx);
