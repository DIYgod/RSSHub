const webApiImpl = require('./web-api/tweet');

export default async (ctx) => {
    await webApiImpl(ctx);
};
