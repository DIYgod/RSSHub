import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/xna',
    categories: ['bbs', 'blog'],
    view: ViewType.Articles,
    example: '/v2ex/xna',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'XNA',
    maintainers: ['luckyscript'],
    handler,
};

async function handler(ctx) {
    const host = 'https://v2ex.com';
    const pageUrl = `${host}/xna`;

    const response = await got({
        method: 'get',
        url: pageUrl,
    });

    const $ = load(response.data);
    const items = $('div.xna-entry-main-container')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .map((dom) => {
            const link = $(dom).find('.xna-entry-title > a');
            const author = $(dom).find('.xna-source-author > a').text();

            return {
                title: $(link).text(),
                link: $(link).attr('href'),
                description: $(link).text(),
                author,
            };
        });

    return {
        title: `V2EX-xna`,
        link: pageUrl,
        description: `V2EX-xna`,
        item: items,
    };
}
