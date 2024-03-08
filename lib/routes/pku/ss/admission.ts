import cache from '@/utils/cache';
import { baseUrl, getSingleRecord, getArticle } from './common';

const host = `${baseUrl}/admission/admnotice/`;

export default async (ctx) => {
    const items = await getSingleRecord(host);
    const out = await Promise.all(items.map((item) => getArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: '北大软微-招生通知',
        description: '北京大学软件与微电子学院 - 招生通知',
        link: host,
        item: out,
    });
};
