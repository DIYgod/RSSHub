// const config = require('@/config').value;
// const devApiImpl = require('./developer-api/user');
const webApiImpl = require('./web-api/media');

module.exports = async (ctx) => {
    await webApiImpl(ctx);
};
