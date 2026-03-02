import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/cat/:cat{.+}?',
    parameters: {
        cat: '默认值为 `8kasianidol`，将目录页面url中 /category/ 后面的部分填入。如：https://www.8kcosplay.com/category/8kchineseidol/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f/ 对应的RSS页面为 /8kcos/cat/8kchineseidol/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f。',
    },
    example: '/8kcos/cat/8kasianidol',
    radar: [
        {
            source: ['8kcosplay.com/'],
            target: '',
        },
    ],
    name: '分类',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const { cat = '8kasianidol' } = ctx.req.param();
    const url = `${SUB_URL}category/${cat}/`;
    const resp = await got(url);
    const $ = load(resp.body);
    const itemRaw = $('li.item').toArray();
    return {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            (limit ? itemRaw.slice(0, limit) : itemRaw)
                .map((e) => {
                    const linkEl = load(e)('h3.item-title > a')[0];
                    if (!linkEl?.attribs?.href) {
                        return null;
                    }
                    return cache.tryGet(linkEl.attribs.href, () => loadArticle(linkEl.attribs.href));
                })
                .filter(Boolean)
        ),
    };
}
