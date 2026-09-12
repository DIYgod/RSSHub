import type { Route } from '@/types';
import buildData from '@/utils/common-config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/stratechery',
    name: 'Blog',
    maintainers: ['chazeon'],
    handler,
};

async function handler() {
    const link = 'https://stratechery.com/';

    return await buildData({
        link,
        url: link,
        title: 'Stratechery by Ben Thompson',
        author: 'Ben Thompson',
        description: 'Stratechery provides analysis of the strategy and business side of technology and media, and the impact of technology on society. ',
        item: {
            item: 'article',
            title: ($) => $('article > header > h1 > a').text(),
            link: ($) => $('article > header > h1 > a').attr('href'),
            pubDate: ($) => {
                const datetime = $('article .entry-date').attr('datetime');
                return datetime ? parseDate(datetime) : undefined;
            },
            description: ($) => $('article > .entry-content').html()!.replaceAll('%', '&percnt;'),
        },
    });
}
