import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    name: 'PAIR - AI Explorables',
    url: 'pair.withgoogle.com/explorables',
    path: '/explorables',
    maintainers: ['cesaryuan'],
    example: '/withgoogle/explorables',
    categories: ['blog'],
    radar: [
        {
            source: ['pair.withgoogle.com/explorables'],
            target: '',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://pair.withgoogle.com';
        const response = await ofetch(baseUrl + '/explorables', {
            method: 'GET',
        });
        const $ = load(response);
        const list = $('div.explorable-card').toArray();
        const items = await pMap(
            list,
            async (el) => {
                const title = $(el).find('h3').text();
                const image = $(el).find('img').attr('src');
                const link = baseUrl + $(el).find('a').attr('href');
                const detail = await cache.tryGet(`withgoogle:detail:v3:${link}`, async (): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> => {
                    const response = await ofetch(link);
                    const $item = load(response);
                    const author = $item('.byline .authors b')
                        .toArray()
                        .map((author) => $item(author).text().trim())
                        .join(', ');
                    const date = $item('.byline .date').text();
                    $item('.header, h1.headline, .byline, #recirc, .recirc-feedback-form, link').remove();
                    $item('h3')
                        .filter((_, heading) => $item(heading).text() === 'More Explorables')
                        .remove();
                    return {
                        description: $item('body').html(),
                        author: author || undefined,
                        pubDate: parseDate(date, 'MMMM YYYY'),
                    };
                });
                return { title, link, image, ...detail };
            },
            { concurrency: 3 }
        );
        return {
            title: 'PAIR - AI Explorables',
            link: 'https://pair.withgoogle.com/explorables',
            item: items,
        };
    },
};
