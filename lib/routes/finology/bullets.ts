import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bullets',
    categories: ['finance'],
    example: '/finology/bullets',
    radar: [
        {
            source: ['insider.finology.in/bullets'],
        },
    ],
    name: 'Bullets',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'insider.finology.in/bullets',
};

async function handler() {
    const baseUrl = 'https://insider.finology.in/bullets';

    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const listItems = $('ul.timeline li.m-pb2')
        .toArray()
        .map((item) => {
            item = $(item);
            const time = item.find('div.timeline-info span').text().split(', ')[1];
            const a = item.find('a.bullet_share_div');
            const description = item.find('div.bullet-desc').html();
            return {
                title: a.attr('data-bullettitle'),
                link: a.attr('data-bulleturl'),
                pubDate: parseDate(time, 'DD MMMM'),
                description,
            };
        });

    return {
        title: 'Finology Insider Bullets',
        link: baseUrl,
        item: listItems,
        description: 'Your daily dose of crisp, spicy financial news in 80 words.',
        logo: 'https://assets.finology.in/insider/images/favicon/apple-touch-icon.png',
        icon: 'https://assets.finology.in/insider/images/favicon/favicon-32x32.png',
        language: 'en-us',
    };
}
