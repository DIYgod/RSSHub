import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.kisskiss.tv/kiss/diary.php';

export const route: Route = {
    path: '/blog/:category?',
    categories: ['game'],
    example: '/blog/DLC',
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

async function handler(ctx) {
    const { category } = ctx.req.param();
    const url = category ? `${baseUrl}?category=${category}` : baseUrl;

    const response = await got(url);
    const $ = load(response.data);

    const items = $('table.blog_frame_top')
        .toArray()
        .map((item) => {
            const title = $(item);
            const body = title.next('div.blog_frame_middle');
            const i = {
                title: title.find('tbody tr td').text(),
                link: title.find('tbody tr td a').attr('href'),
                pubDate: timezone(
                    parseDate(
                        body
                            .find('div.blog_data div.data_r')
                            .text()
                            .match(/\d+年\d+月\d+日 \(\d+:\d+\)/)[0],
                        'YYYY年M月D日 (HH:mm)'
                    ),
                    9
                ),
            };
            body.find('a img').each(function () {
                $(this).attr('src', $(this).parent('a').attr('href'));
                $(this).unwrap();
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
