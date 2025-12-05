import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ORIGIN = 'https://miyuki.jp';
const NEWS_LINK = `${ORIGIN}/s/y10/news/list`;

export const route: Route = {
    path: '/news',
    example: '/miyuki/news',
    name: 'News',
    categories: ['new-media'],
    maintainers: ['KarasuShin'],
    features: {
        supportRadar: true,
    },
    handler,
    radar: [
        {
            source: ['miyuki.jp', 'miyuki.jp/s/y10/news/list'],
            target: '/news',
        },
    ],
};

async function handler() {
    const $ = load(await ofetch(NEWS_LINK));
    const items = await Promise.all(
        $('.list__side_border li')
            .toArray()
            .map(async (item) => {
                const $item = $(item);
                const link = `${ORIGIN}${$item.find('a').attr('href')!}`;
                return await cache.tryGet(link, async () => {
                    const category = $item.find('p span').last().text();
                    return {
                        title: `${category} - ${$item.find('a').text()}`,
                        link,
                        pubDate: timezone(parseDate($item.find('p span').first().text()), +9),
                        category: [category],
                        description: await cache.tryGet(link, async () => {
                            const $detail = load(await ofetch(link));
                            return $detail('.contents_area__inner').html()!;
                        }),
                    } as DataItem;
                });
            })
    );

    return {
        title: '中島みゆき Official - News',
        link: NEWS_LINK,
        item: items,
    };
}
