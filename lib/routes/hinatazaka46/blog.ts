import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.hinatazaka46.com';

export const route: Route = {
    path: '/blog/:id?/:page?',
    categories: ['new-media'],
    example: '/hinatazaka46/blog',
    parameters: { id: 'Member ID, see below, `all` by default', page: 'Only the first page (`0`) is supported; omit this parameter or use `0`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '博客',
    maintainers: ['yj-qin', 'AkashiGakki'],
    handler,
    description: `Member ID

| Member ID | Name         |
| --------- | ------------ |
| 2000      | 四期生リレー |
| 36        | 渡辺 莉奈    |
| 35        | 山下 葉留花  |
| 34        | 宮地 すみれ  |
| 33        | 藤嶌 果歩    |
| 32        | 平岡 海月    |
| 31        | 平尾 帆夏    |
| 30        | 竹内 希来里  |
| 29        | 正源司 陽子  |
| 28        | 清水 理央    |
| 27        | 小西 夏菜実  |
| 26        | 岸 帆夏      |
| 25        | 石塚 瑶季    |
| 24        | 山口 陽世    |
| 23        | 森本 茉莉    |
| 22        | 髙橋 未来虹  |
| 21        | 上村 ひなの  |
| 18        | 松田 好花    |
| 17        | 濱岸 ひより  |
| 16        | 丹生 明里    |
| 15        | 富田 鈴花    |
| 14        | 小坂 菜緒    |
| 13        | 河田 陽菜    |
| 12        | 金村 美玖    |
| 11        | 東村 芽依    |
| 10        | 高本 彩花    |
| 9         | 高瀬 愛奈    |
| 8         | 佐々木 美玲  |
| 7         | 佐々木 久美  |
| 6         | 齊藤 京子    |
| 5         | 加藤 史帆    |
| 4         | 影山 優佳    |
| 2         | 潮 紗理菜    |`,
};

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 9);
}

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'all';
    const page = ctx.req.param('page') ?? '0';
    if (page !== '0') {
        throw new InvalidParameterError('Only the first blog page is supported. Omit page or use 0.');
    }

    const params = id === 'all' ? `?page=${page}` : `?page=${page}&ct=${id}`;
    const currentUrl = `${rootUrl}/s/official/diary/member/list${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const items = $('div.p-blog-group .p-blog-article')
        .toArray()
        .map((item) => {
            const content = $(item);

            return {
                title: content.find('.c-blog-article__title').text(),
                link: content.find('.c-button-blog-detail').attr('href'),
                pubDate: parsePublicationDate(content.find('.c-blog-article__date').text()),
                author: content.find('.c-blog-article__name').text(),
                description: content.find('.c-blog-article__text').html(),
            };
        });

    return {
        language: 'ja' as const,
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
