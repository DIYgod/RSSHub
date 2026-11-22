import { load } from 'cheerio';
import pMap from 'p-map';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { appsUrl } from '../utils';

export const route: Route = {
    path: ['/apps/:lang/note/:id', '/apps/note/:id'],
    categories: ['anime'],
    example: '/qoo-app/apps/en/note/7675',
    parameters: {
        lang: 'Language, see the table above, empty means `中文`',
        id: 'Game ID, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Game Store - Notes',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { id, lang = '' } = ctx.req.param();
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-note/${id}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.content-title').text() || $item.find('.description').text(),
                link: $item.find('a.link-wrap').attr('href'),
                description: $item.find('.description').text(),
                pubDate: parseDate($item.find('time').text(), 'YYYY-MM-DD HH:mm', 8),
                author: $item.find('cite.name').text(),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('footer').remove();
                item.description = $('article .content').html() ?? '';

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang') as Language,
        item: items,
    };
}
