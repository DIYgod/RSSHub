import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.itsec.gov.cn';
const currentUrl = `${rootUrl}/zxxw/index.html`;

export const route: Route = {
    path: '/news',
    categories: ['government'],
    example: '/itsec/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻发布',
    maintainers: ['ch3n4y'],
    radar: [
        {
            source: ['www.itsec.gov.cn/zxxw/index.html', 'www.itsec.gov.cn/zxxw/'],
            target: '/news',
        },
    ],
    handler,
};

async function handler() {
    const { data: response } = await got(currentUrl);
    const $ = load(response);

    const list = $('.listbox .list-every li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const title = $link.text() || $link.prop('title');
            const href = $link.prop('href');
            const date = $item.find('span').text();

            if (!title || !href) {
                return null;
            }

            const link = new URL(href, currentUrl).href;

            return {
                title,
                link,
                pubDate: date && Number.isFinite(parseDate(date).getTime()) ? parseDateInTimezone(date, 8) : undefined,
            };
        })
        .filter((item): item is { title: string; link: string; pubDate: Date | undefined } => item !== null);

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`itsec:news-details:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);
                const $detail = load(detailResponse);

                const title = $detail('.article-tit').text();
                const date = $detail('.article .date').text();
                const author = $detail('.article .from').last().text().trim();

                $detail('#js_content style').remove();
                const description = $detail('#js_content .TRS_Editor').html() || $detail('#js_content').html();

                return {
                    title,
                    link: item.link,
                    description,
                    author,
                    pubDate: date && Number.isFinite(parseDate(date).getTime()) ? parseDateInTimezone(date, 8) : undefined,
                };
            });
            return { ...item, ...details, title: details.title || item.title, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: '中国信息安全测评中心 - 新闻发布',
        link: currentUrl,
        item: items,
    };
}
