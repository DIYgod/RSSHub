// import { config } from '~/config.js';
// const devApiImpl = require('./developer-api/user');
const webApiImpl = require('./web-api/media');

export default async (ctx) => {
    await webApiImpl(ctx);
};
