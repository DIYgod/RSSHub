import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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

async function handler() {
    const baseUrl = 'https://info-maimai.sega.jp/';

    const parseContent = (htmlString: string, image: cheerio.Cheerio<cheerio.Element>) => {
        const $ = cheerio.load(htmlString);
        const content = $('.maiMd');
        content.prepend(image);
        content.find('.hrLine').replaceWith('<hr/>');
        return content.html();
    };

    const response = await got(baseUrl);
    const $ = cheerio.load(response.data);
    const list = $('.maiPager-content .newsBox');

    const item = await Promise.all(
        list.map(async (_, items) => {
            const i = $(items);
            const title = i.find('.newsLink').text();
            const pubDateStr = i.find('.newsDate').text().slice(0, 10);
            const pubDate = parseDate(pubDateStr, 'YYYY.MM.DD');
            const image = i.find('.newsImg');
            const link = i.find('a').attr('href') as string;
            return await cache.tryGet(link, async () => {
                const response = await got(link);
                const description = parseContent(response.body, image);
                return {
                    title,
                    link,
                    description,
                    pubDate,
                };
            });
        })
    );

    return {
        title: 'maimai DX - Japanese Ver. News',
        link: baseUrl,
        language: 'ja',
        item,
    };
}
