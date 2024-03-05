// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { apiUrl, favicon, getBParam, getBuildId, getGToken, parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const { categoryId = '1', lang = 'en' } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();
    const gToken = await getGToken(cache.tryGet);
    const bParam = getBParam(lang);

    const { data: response } = await got.post(`${apiUrl}/feed/list/recommended`, {
        headers: {
            'x-bparam': JSON.stringify(bParam),
            'x-gtoken': gToken,
        },
        json: {
            category_id: Number.parseInt(categoryId),
            count: Number.parseInt(limit),
        },
    });
    if (response.code !== 2000) {
        throw new Error(response.msg);
    }

    const buildId = await getBuildId(cache.tryGet);

    const list = parseList(response.data.list, lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: 'Followin',
        link: 'https://followin.io',
        image: favicon,
        item: items,
    });
};
