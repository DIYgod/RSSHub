import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.kisskiss.tv/kiss/diary.php';

export const route: Route = {
    path: '/blog/:category?',
    categories: ['game'],
    example: '/kisskiss/blog/DLC',
    parameters: { category: 'category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.kisskiss.tv/kiss/diary.php'],
            target: '/blog',
        },
    ],
    name: 'ブログ',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { category } = ctx.req.param();
    const url = category ? `${baseUrl}?category=${category}` : baseUrl;

    const response = await got(url);
    const $ = load(response.data);

    const items = $('table.blog_frame_top')
        .toArray()
        .map((item) => {
            const title = $(item);
            const body = title.next('div.blog_frame_middle');
            const sourceDate = body
                .find('div.blog_data div.data_r')
                .text()
                .match(/\d{4}年\d{1,2}月\d{1,2}日\s*\(\d{2}:\d{2}\)/)?.[0]
                .replace(/\s*\(/, ' (');
            const parsedDate = sourceDate ? parseDate(sourceDate, ['YYYY年MM月DD日 (HH:mm)', 'YYYY年M月D日 (HH:mm)'], true) : undefined;
            const i: DataItem = {
                title: title.find('tbody tr td').text(),
                link: title.find('tbody tr td a').attr('href'),
                category: body
                    .find('div.blog_data div.data_r a[href*="category="]')
                    .toArray()
                    .map((a) => $(a).text()),
                pubDate: parsedDate && Number.isFinite(parsedDate.getTime()) ? timezone(parsedDate, 9) : undefined,
            };
            body.find('a img').each((_, el) => {
                $(el).attr('src', $(el).parent('a').attr('href'));
                $(el).unwrap();
            });
            body.find('div.blog_data').remove();
            i.description = `<div lang="ja-JP">${body.html()}</div>`;
            return i;
        });

    return {
        title: 'KISS ブログ',
        link: url,
        item: items,
        language: 'ja',
    };
}
