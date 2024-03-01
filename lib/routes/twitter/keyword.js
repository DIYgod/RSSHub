const webApiImpl = require('./web-api/search');

export default async (ctx) => await webApiImpl(ctx);
