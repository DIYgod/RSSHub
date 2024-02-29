const webApiImpl = require('./web-api/tweet');

module.exports = async (ctx) => {
    await webApiImpl(ctx);
};
