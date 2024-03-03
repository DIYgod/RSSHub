// @ts-nocheck
import cache from '@/utils/cache';
const { baseUrl, getSingleRecord, getArticle } = require('./common');

const host = `${baseUrl}/admission/admbrochure/`;

export default async (ctx) => {
    const items = await getSingleRecord(host);
    const out = await Promise.all(items.map((item) => getArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: '北大软微-硕士统考招生',
        description: '北京大学软件与微电子学院 - 硕士统考招生通知',
        link: host,
        item: out,
    });
};
