import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/videos',
    categories: ['multimedia'],
    example: '/hentaimama/videos',
    name: 'Recent Videos',
    features: { nsfw: true },
    maintainers: ['DrakeTDL'],
    handler,
};

async function handler(): Promise<Data> {
    const link = 'https://hentaimama.io/recent-episodes/';
    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: 'Hentaimama - Recent Videos',
        link,
        language: 'en-us',
        item: $('.item.episodes')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const date = $item.find('.data span').text();

                return {
                    title: $item.find('img').attr('alt') ?? '',
                    description: `<img src="${$item.find('img').attr('data-src')}">`,
                    pubDate: date ? parseDate(date) : undefined,
                    link: $item.find('a').attr('href'),
                };
            }),
    };
}
