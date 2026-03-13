import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ORIGIN = 'https://miyuki.jp';
const NEWS_LINK = `${ORIGIN}/s/y10/news/list`;
const DETAIL_HEADER_SELECTOR = [
    '.pc__news_detail__title',
    '.pc__news_detail__title__japanese',
    '.news_detail__date',
    '.news_detail__title',
    '.news_detail__ganre',
].join(', ');

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
    const html = await ofetch(NEWS_LINK);
    const $ = load(html);
    const items = await Promise.all(
        $('.list__side_border li')
            .toArray()
            .map(async (item) => {
                const $item = $(item);
                const link = `${ORIGIN}${$item.find('a').attr('href')!}`;
                return cache.tryGet(link, async () => {
                    const category = $item.find('p span').last().text();
                    const title = $item.find('a').text();
                    return {
                        title: category ? `[${category}] ${title}` : title,
                        link,
                        pubDate: timezone(parseDate($item.find('p span').first().text()), +9),
                        category: [category],
                        description: await getDescription(link),
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

async function getDescription(link: string) {
    const detailHtml = await ofetch(link);
    const $ = load(detailHtml);
    const content = $('.contents_area__inner').clone();
    content.find(DETAIL_HEADER_SELECTOR).remove();

    return content.html() ?? '';
}
