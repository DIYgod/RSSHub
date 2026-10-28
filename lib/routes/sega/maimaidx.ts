import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/maimaidx/news',
    categories: ['game'],
    example: '/sega/maimaidx/news',
    radar: [
        {
            source: ['info-maimai.sega.jp/'],
        },
    ],
    name: 'maimai DX Japanese Ver. News',
    maintainers: ['randompasser'],
    handler,
    url: 'info-maimai.sega.jp/',
};

const parseContent = (htmlString: string, image: Cheerio<Element>) => {
    const $ = load(htmlString);
    const content = $('.maiMd');
    content.prepend(image);
    content.find('.hrLine').replaceWith('<hr/>');
    return content.html();
};

async function handler() {
    const baseUrl = 'https://info-maimai.sega.jp/';

    const response = await got(baseUrl);
    const $ = load(response.data);
    const list = $('.maiPager-content .newsBox');

    const item = await pMap(
        list.toArray(),
        async (items) => {
            const i = $(items);
            const title = i.find('.newsLink').text();
            const pubDateStr = i.find('.newsDate').text().slice(0, 10);
            const pubDate = pubDateStr ? parseDate(`${pubDateStr.replaceAll('.', '-')}T00:00:00Z`) : undefined;
            const image = i.find('.newsImg');
            const link = i.find('a').attr('href')!;
            const detailHtml = await cache.tryGet(`${link}:html`, async () => {
                const response = await got(link);
                return response.body;
            });
            return {
                title,
                link,
                description: parseContent(detailHtml, image),
                pubDate,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: 'maimai DX - Japanese Ver. News',
        link: baseUrl,
        language: 'ja' as const,
        item,
    };
}
