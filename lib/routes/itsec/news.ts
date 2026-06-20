import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
            const $link = $item.find('a').first();
            const title = $link.text() || $link.prop('title');
            const href = $link.prop('href');
            const date = $item.find('span').first().text().trim();

            if (!title || !href) {
                return null;
            }

            const link = new URL(href, currentUrl).href;

            return {
                title,
                link,
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
            };
        })
        .filter((item): item is { title: string; link: string; pubDate?: Date } => item !== null);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const $detail = load(detailResponse);

                const title = $detail('.article-tit').text() || item.title;
                const date = $detail('.article .date').text().trim();
                const author = $detail('.article .from').last().text().trim();

                $detail('#js_content script, #js_content style').remove();
                const description = $detail('#js_content .TRS_Editor').html() || $detail('#js_content').html();

                return {
                    title,
                    link: item.link,
                    description,
                    author,
                    pubDate: date ? timezone(parseDate(date), 8) : item.pubDate,
                };
            })
        )
    );

    return {
        title: '中国信息安全测评中心 - 新闻发布',
        link: currentUrl,
        item: items,
    };
}
