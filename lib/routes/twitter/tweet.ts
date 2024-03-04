// @ts-nocheck
import webApiImpl from './web-api/tweet';

export default async (ctx) => {
    await webApiImpl(ctx);
};
