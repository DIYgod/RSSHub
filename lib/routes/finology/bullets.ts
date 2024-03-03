// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
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

    ctx.set('data', {
        title: 'Finology Insider Bullets',
        link: baseUrl,
        item: listItems,
        description: 'Your daily dose of crisp, spicy financial news in 80 words.',
        logo: 'https://assets.finology.in/insider/images/favicon/apple-touch-icon.png',
        icon: 'https://assets.finology.in/insider/images/favicon/favicon-32x32.png',
        language: 'en-us',
    });
};
