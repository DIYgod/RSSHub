import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:lang/:module',
    categories: ['government'],
    example: '/burlington.ca/en/FestivalsEvents',
    parameters: {
        lang: 'language',
        module: 'module',
    },
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
            source: ['www.burlington.ca/Modules/News/:lang/:module'],
            target: '/:lang/:module',
        },
    ],
    name: 'Burlington.ca',
    maintainers: ['elibroftw'],
    handler,
    description: 'Get news and events from Burlington.ca modules',
};

async function handler(ctx: Context) {
    const { lang, module } = ctx.req.param();
    const url = `https://www.burlington.ca/Modules/News/${lang}/${module}`;

    const response = await ofetch(url);
    const $ = load(response);

    let items = $('div.blogItem')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const title = $item.find('h2 a').text().trim();
            const relativeLink = $item.find('h2 a').attr('href');
            if (!relativeLink) {
                return null;
            }
            const link = relativeLink.startsWith('http') ? relativeLink : `https://www.burlington.ca${relativeLink}`;
            const dateStr = $item.find('.blogPostDate p').text().trim().replace('Posted on ', '');
            const description = $item.find('div.blogItem-contentContainer').html();

            return {
                title,
                link,
                pubDate: dateStr,
                description,
                guid: link,
            };
        })
        .filter((item): item is any => !!item);

    items = items.filter((item) => item.title && item.link);

    return {
        title: $('title').text() || `Burlington.ca ${module}`,
        link: url,
        item: items,
    };
}
