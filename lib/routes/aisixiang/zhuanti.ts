import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { ossUrl, ProcessFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/zhuanti/:id',
    categories: ['reading'],
    example: '/aisixiang/zhuanti/211',
    parameters: { id: '专题 ID, 可在对应专题 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  更多专题请见 [关键词](http://www.aisixiang.com/zhuanti/)
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`zhuanti/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = $('div.tips h2').first().text();

    const items = $('div.article-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: a.text().split('：')[0],
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });

    return {
        item: await ProcessFeed(limit, cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        description: $('div.tips p').text(),
        language: 'zh-cn',
        image: new URL('images/logo_zhuanti.jpg', ossUrl).href,
        subtitle: title,
    };
}
