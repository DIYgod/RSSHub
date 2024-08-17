import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/latest',
    categories: ['blog'],
    example: '/latest',
    radar: [
        {
            source: ['towardsdatascience.com/'],
        },
    ],
    name: 'Towards Data Science',
    maintainers: ['mintyfrankie'],
    url: 'towardsdatascience.com/latest',
    handler,
};

async function handler() {
    const baseUrl = 'https://towardsdatascience.com/latest';
    const feedLang = 'en';
    const feedDescription = 'Latest articles from Towards Data Science';

    const response = await ofetch(baseUrl);
    const $ = load(response);

    const list = $('div.postArticle')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.postArticle-content a');
            const title = a.find('h3').text();
            const originalLink = a.attr('href').split('?')[0];
            const link = `https://freedium.cfd/${originalLink}`;

            const header = item.find('div.postMetaInline-authorLockup');
            const author = header.find('a.ds-link').text().replace('Towards Data Science', '').trim();
            const pubDate = parseDate(header.find('time').attr('datetime'));

            return {
                title,
                link,
                author,
                pubDate,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('div.main-content').first().html();
                return item;
            })
        )
    );

    return {
        title: 'Towards Data Science - Latest',
        language: feedLang,
        description: feedDescription,
        link: baseUrl,
        item: items,
    };
}
