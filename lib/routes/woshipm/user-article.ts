import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';

import { baseUrl, parseArticleDate, parseUserArticle } from './utils';

export const route: Route = {
    path: '/user_article/:id',
    categories: ['new-media'],
    example: '/woshipm/user_article/324696',
    parameters: { id: '用户 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['woshipm.com/u/:id'],
        },
    ],
    name: '用户文章',
    maintainers: ['LogicJake'],
    handler,
};
async function handler(ctx) {
    const id = ctx.req.param('id');
    const requestedLimit = Number(ctx.req.query('limit'));
    // Preserve the existing positive-integer limit without introducing a new upper bound.
    // oxlint-disable-next-line unicorn-js/prefer-number-is-safe-integer
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 12;
    const link = `${baseUrl}/u/${id}`;
    const data = (await got(link)).data;
    const $ = load(data);
    const name = $('.author--meta .name').text() || $('title').text().split(' | ', 1)[0];
    const list = $('.post--card')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const postCardTitle = $item.find('h2.post--card__title a');
            return {
                title: postCardTitle.attr('title')!,
                link: postCardTitle.attr('href'),
                pubDate: parseArticleDate($item.find('time').text()),
            };
        });
    const items = await pMap(list, parseUserArticle, { concurrency: 3 });
    return {
        title: `${name}的文章-人人都是产品经理`,
        description: $('.author--meta .description').text(),
        image: $('.author--meta .avatar').attr('src')?.split('!', 1)[0],
        link,
        item: items,
    };
}
