import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type',
    categories: ['other'],
    example: '/emi-nitta/updates',
    parameters: {
        type: 'Type, `updates` or `news`',
    },
    radar: [
        { source: ['emi-nitta.net/updates'], target: '/updates' },
        { source: ['emi-nitta.net/contents/news'], target: '/news' },
    ],
    name: 'Recent update / News',
    maintainers: ['luyuhuang'],
    handler,
};

const rootUrl = 'https://emi-nitta.net';

const config = {
    updates: {
        link: '/updates',
        title: 'Emi Nitta - Updates',
        description: 'Recent update of Emi Nitta official website',
    },

    news: {
        link: '/contents/news',
        title: 'Emi Nitta - News',
        description: 'News of Emi Nitta',
    },
};

const getDate = (o: Cheerio<any>) => {
    const match = /(\d{4}\.\d+\.\d+)/.exec(o.text());
    const date = match ? match[1] : o.attr('datetime');
    return timezone(parseDate(date!), 9);
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const cfg = config[type];
    if (!cfg) {
        throw new Error('Bad type');
    }

    const response = await ofetch(new URL(cfg.link, rootUrl).href);

    const $ = load(response);
    const list = $('article.details ul.list-unstyled li a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('div.title h3').text(),
                link: $item.attr('href')!,
                pubDate: getDate($item.find('time')),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`emi-nitta${item.link}`, async () => {
                const detailUrl = new URL(item.link, rootUrl).href;
                const res = await ofetch(detailUrl);
                const content = load(res);

                return {
                    ...item,
                    description: content('article.details div.body').html(),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: cfg.title,
        description: cfg.description,
        link: rootUrl,
        item: items,
    };
}
