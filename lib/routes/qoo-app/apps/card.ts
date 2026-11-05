import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { appsUrl, createPageFetcher } from '../utils';

export const route: Route = {
    path: ['/apps/:lang/card/:id', '/apps/card/:id'],
    categories: ['anime'],
    example: '/qoo-app/apps/en/card/7675',
    parameters: {
        lang: 'Language, see the table above, empty means `中文`',
        id: 'Game ID, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Game Store - Cards',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const pageFetcher = createPageFetcher();
    try {
        const { id, lang = '' } = ctx.req.param();
        const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-card/${id}`;

        const response = await pageFetcher.get(link);
        const $ = load(response);

        const items = $('.qoo-post-item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const name = $item.find('.qoo-clearfix .name a');
                const author = name.eq(0).text();
                const pubDate = timezone(parseDate($item.find('time').text(), 'YYYY-MM-DD HH:mm:ss'), 8);
                $item.find('a.icon, .qoo-clearfix, footer, article.qoo-comment-panel, div.slot').remove();
                $item.find('.img-list').attr('data-target', '');
                return {
                    title: `${author} ▶ ${name.eq(1).text()}`,
                    description: $item.html(),
                    pubDate,
                    author,
                    guid: `qoo-app:apps:card:${id}:${$item.attr('data-id')}`,
                };
            });

        return {
            title: $('head title').text(),
            link,
            language: $('html').attr('lang') as Language,
            item: items,
        };
    } finally {
        await pageFetcher.close();
    }
}
