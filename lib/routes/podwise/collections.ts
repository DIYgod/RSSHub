import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/explore',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/podwise/explore',
    radar: [
        {
            source: ['podwise.ai', 'podwise.ai/explore'],
        },
    ],
    name: 'Collections',
    maintainers: ['lyling'],
    handler: async () => {
        const link = 'https://podwise.ai/explore';
        const response = await ofetch(link);
        const $ = load(response);
        const seen = new Set<string>();
        const items = $('main a.group[href*="/collections/"]')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('h2, h3').first().text(),
                    link: new URL($item.attr('href')!, link).href,
                    description: $item.find('p').first().text(),
                };
            })
            .filter((item) => {
                if (seen.has(item.link)) {
                    return false;
                }
                seen.add(item.link);
                return true;
            });

        return {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content'),
            item: items,
            link,
        };
    },
};
