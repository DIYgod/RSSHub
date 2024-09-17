import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    name: 'PAIR - AI Exploreables',
    url: 'pair.withgoogle.com/explorables',
    path: '/explorables',
    maintainers: ['cesar'],
    example: '/withgoogle/explorables',
    handler: async () => {
        const baseUrl = 'https://pair.withgoogle.com';
        const response = await ofetch(baseUrl + '/explorables', {
            method: 'GET',
        });
        const $ = load(response);
        const items = await Promise.all(
            $('div.explorable-card')
                .map(async (_, el) => {
                    const title = $(el).find('h3').text();
                    const image = $(el).find('img').attr('src');
                    const link = $(el).find('a').attr('href');
                    let description;
                    if (link) {
                        description = await cache.tryGet(link, async () => {
                            const response = await ofetch(baseUrl + link);
                            const $item = load(response);
                            return $item('body').html() || '';
                        });
                    }
                    if (!description || description.trim() === '') {
                        description = $('p').text();
                    }
                    return {
                        title,
                        link: baseUrl + link,
                        description,
                        image,
                    };
                })
                .toArray()
        );
        return {
            title: 'PAIR - AI Exploreables',
            link: 'https://pair.withgoogle.com/explorables',
            item: items,
        };
    },
};
