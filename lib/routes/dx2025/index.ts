import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

const sourceOrigins = new Set(['https://www.dx2025.com', 'https://www.dx2035.cn']);

function isExpiredCertificate(error: unknown): error is Error {
    return error instanceof Error && (('code' in error && error.code === 'CERT_HAS_EXPIRED') || isExpiredCertificate(error.cause));
}

async function fetchHtml(url: string, page?: Page): Promise<string> {
    if (!page) {
        const { data } = await got(url);
        return data;
    }
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (!response?.ok() || !sourceOrigins.has(new URL(page.url()).origin)) {
        throw new Error(`DX2025 did not provide its public page: ${url}`);
    }
    return await response.text();
}

export const route: Route = {
    path: '/:type?/:category?',
    categories: ['new-media'],
    example: '/dx2025',
    parameters: { type: '内容类别，见下表，默认为空', category: '行业分类，见下表，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `内容类别

| 产业观察             | 行业报告         | 政策   | 数据 |
| -------------------- | ---------------- | ------ | ---- |
| industry-observation | industry-reports | policy | data |

行业分类

| 行业                 | 行业名称                                                          |
| -------------------- | ----------------------------------------------------------------- |
| 新一代信息技术       | next-generation-information-technology-industry-reports           |
| 高档数控机床和机器人 | high-grade-cnc-machine-tools-and-robots-industry-reports          |
| 航空航天装备         | aerospace-equipment-industry-reports                              |
| 海工装备及高技术船舶 | marine-engineering-equipment-and-high-tech-ships-industry-reports |
| 先进轨道交通装备     | advanced-rail-transportation-equipment-industry-reports           |
| 节能与新能源汽车     | energy-saving-and-new-energy-vehicles-industry-reports            |
| 电力装备             | electric-equipment-industry-reports                               |
| 农机装备             | agricultural-machinery-equipment-industry-reports                 |
| 新材料               | new-material-industry-reports                                     |
| 生物医药及医疗器械   | biomedicine-and-medical-devices-industry-reports                  |
| 现代服务业           | modern-service-industry-industry-reports                          |
| 制造业人才           | manufacturing-talent-industry-reports                             |`,
};

async function handler(ctx) {
    try {
        return await fetchFeed(ctx);
    } catch (error) {
        if (!(error instanceof FetchError) || !isExpiredCertificate(error)) {
            throw error;
        }
    }
    const { page, destroy } = await getPlaywrightPage('https://www.dx2025.com', { noGoto: true, closeTimeout: 0, javaScriptEnabled: false });
    try {
        await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        return await fetchFeed(ctx, page);
    } finally {
        await destroy();
    }
}

async function fetchFeed(ctx, page?: Page) {
    const type = ctx.req.param('type') || '';
    const category = ctx.req.param('category') || '';

    const rootUrl = 'https://www.dx2025.com';
    const currentUrl = `${rootUrl}${type === '' ? '' : `/archives/${type === 'tag' ? `tag${category === '' ? '' : `/${category}`}` : `category/${type}${category === '' ? '' : `/${category}`}`}`}`;
    const response = await fetchHtml(currentUrl, page);

    const $ = load(response);

    const list = $('.entry-title a')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await fetchHtml(item.link!, page);
                const content = load(detailResponse);

                item.author = content('.entry-author-name').text();
                item.description = content('.bpp-post-content, .entry-content').html();
                const pubDate = content('.entry-date').attr('datetime');
                item.pubDate = pubDate ? parseDate(pubDate) : undefined;

                return item;
            }),
        { concurrency: page ? 1 : 10 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
