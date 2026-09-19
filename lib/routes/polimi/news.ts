import type { Context } from 'hono';

import type { Route } from '@/types';
import buildData from '@/utils/common-config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:language?',
    categories: ['university'],
    example: '/polimi/news',
    parameters: { language: 'English language code en' },
    name: 'News',
    maintainers: ['exuanbo'],
    handler,
};

async function handler(ctx: Context) {
    const { language } = ctx.req.param();
    const link = language === 'en' ? 'https://www.polimi.it/en/the-politecnico/news' : 'https://www.polimi.it/il-politecnico/news';

    return await buildData({
        link,
        url: link,
        title: 'Polimi News',
        item: {
            item: '.card--editorial-photo',
            title: ($) => $('.card-title').text(),
            link: ($) => 'https://www.polimi.it' + $('.card-footer a').attr('href'),
            description: ($) => $('.news-bodytext').html(),
            pubDate: ($) => {
                const datetime = $('time').attr('datetime');
                return datetime ? parseDate(datetime) : undefined;
            },
        },
    });
}
