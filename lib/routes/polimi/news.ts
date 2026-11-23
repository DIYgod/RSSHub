import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import buildData from '@/utils/common-config';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news/:language?',
    categories: ['university'],
    example: '/polimi/news',
    parameters: { language: 'English language code en' },
    name: 'News',
    maintainers: ['exuanbo'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { language } = ctx.req.param();
    const link = language === 'en' ? 'https://www.polimi.it/en/the-politecnico/news' : 'https://www.polimi.it/il-politecnico/news';

    const data = await buildData({
        link,
        url: link,
        title: 'Polimi News',
        item: {
            item: '.card--editorial-photo',
            title: ($) => $('.card-title').text(),
            link: ($) => {
                const href = $('.card-footer a').attr('href');
                return href ? new URL(href, 'https://www.polimi.it').href : undefined;
            },
            description: ($) => $('.news-bodytext').html(),
            pubDate: ($) => parseDate($('time').attr('datetime')!, undefined, 'Europe/Rome'),
        },
    });
    return { ...data, language: language === 'en' ? 'en' : 'it' };
}
