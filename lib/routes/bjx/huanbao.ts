import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';
import type { APIRequestContext } from 'patchright';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { fetchBjxPage, getBjxPage } from './utils';

export const route: Route = {
    path: '/huanbao',
    categories: ['traditional-media'],
    example: '/bjx/huanbao',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huanbao.bjx.com.cn/yw', 'huanbao.bjx.com.cn/'],
        },
    ],
    name: '环保要闻',
    maintainers: ['zsimple'],
    handler,
    url: 'huanbao.bjx.com.cn/yw',
};

async function handler() {
    const listURL = 'https://huanbao.bjx.com.cn/yw/';
    const { page, context, destroy } = await getBjxPage(listURL);
    try {
        const html = await page.content();
        const $ = load(html);
        let items = $('.cc-layout-3 .cc-list-content li')
            .toArray()
            .map((e) => {
                const $e = $(e);
                return {
                    title: $e.find('a').attr('title')!,
                    link: $e.find('a').attr('href')!,
                    pubDate: parseDate($e.find('span').text()),
                };
            });

        items = await pMap(
            // Limit concurrent article requests to avoid per-IP throttling.
            items,
            (item) => fetchPage(item.link, context.request),
            { concurrency: 3 }
        );

        return {
            title: '北极星环保 - 环保行业垂直门户网站',
            link: listURL,
            item: items,
        };
    } finally {
        await destroy();
    }
}

const fetchPage = (link: string, context: APIRequestContext) =>
    cache.tryGet(link, async () => {
        // Long articles can span multiple pages.
        const pages: CheerioAPI[] = [];

        const html = await fetchBjxPage(link, context);
        const $page = load(html);
        pages.push($page);

        // Fetch article pages sequentially to preserve their order.
        const pagelinks = $page('#article_cont .cc-paging a');

        if (pagelinks.length > 0) {
            for (const pagelink of pagelinks) {
                const $a = $page(pagelink);
                if (!/^\d+$/.test($a.text().trim())) {
                    continue;
                }
                const sublink = new URL($a.attr('href')!, link).href;
                /* eslint-disable no-await-in-loop */
                const html = await fetchBjxPage(sublink, context);
                pages.push(load(html));
            }
        }

        const item = {
            title: $page('title').text(),
            description: pages.map(($p) => $p('.cc-article').html() ?? '').join(''),
            pubDate: timezone(parseDate($page('.cc-headline .box p span').eq(0).text()), 8),
            link,
            author: $page('.cc-headline .box p span').eq(1).text(),
        };
        return item;
    });
