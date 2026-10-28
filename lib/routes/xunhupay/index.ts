import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import buildData from '@/utils/common-config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.xunhupay.com';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/xunhupay/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.xunhupay.com/blog', 'www.xunhupay.com/blog.html'],
        },
    ],
    name: '文章',
    maintainers: ['Joey'],
    handler,
    url: 'www.xunhupay.com/blog.html',
};

async function fetchArticleContent(link: string): Promise<Pick<DataItem, 'description'>> {
    const response = await ofetch(link, { responseType: 'text' });
    const $ = load(response);
    return { description: $('.blogc-left > div.line24').first().html() ?? undefined };
}

function parseArticleDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD', true);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handler() {
    const link = `${baseUrl}/blog.html`;
    const data = await buildData({
        link,
        url: link,
        title: '博客',
        description: '虎皮椒-博客',
        item: {
            item: '.blog-post > article',
            title: ($) => $('h5').text(),
            link: ($) => $('a').attr('href'),
            description: ($) => $('.content').text(),
            pubDate: ($) => parseArticleDate($('.date').text()),
            guid: ($) => {
                const href = $('a').attr('href');
                return href ? Buffer.from(href).toString('base64') : undefined;
            },
        },
    });
    const items = await pMap(
        data.item,
        async (item) => {
            if (!item.link) {
                return item;
            }
            const details = await cache.tryGet(`xunhupay:article:${item.link}`, () => fetchArticleContent(item.link!));
            return { ...item, description: details.description ?? item.description };
        },
        { concurrency: 3 }
    );
    return { ...data, item: items };
}
