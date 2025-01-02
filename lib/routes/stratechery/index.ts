import { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/',
    name: 'Unknown',
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
            title: `$('article > header > h1 > a').text()`,
            link: `$('article > header > h1 > a').attr('href')`,
            pubDate: `parseDate($('article .entry-date').attr('datetime'))`,
            description: `$('article > .entry-content').html().replace(/%/g, '&percnt;')`,
        },
    });
}
