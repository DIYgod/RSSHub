import { load } from 'cheerio';
import type { DataItem, Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/gxnas',
    radar: [
        {
            source: ['wp.gxnas.com/'],
        },
    ],
    url: 'wp.gxnas.com/',
    name: '最新文章',
    maintainers: ['Franklittleboy'],
    handler,
    description: `::: warning
该网站受 Cloudflare 保护，自建实例需要 Chromium 支持（默认已包含）。
:::`,
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler() {
    const rootUrl = 'https://wp.gxnas.com';

    const { page, destroy } = await getPlaywrightPage('about:blank');

    // Only load document resources to speed up page load
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    await page.goto(rootUrl, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    await page.close();
    await destroy();

    const $ = load(html);

    const items = $('.article-panel')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const titleEl = $el.find('.header .title a');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const categoryEl = $el.find('.header .label');
            const category = categoryEl.text().trim();
            const contentEl = $el.find('.content');
            const description = contentEl.html() || '';
            const thumbEl = $el.find('.a-thumb img');
            const image = thumbEl.attr('src');

            // Date format: 2023年11月17日
            const dateText = $el.find('.a-meta span').first().text().trim();
            let pubDate: Date | undefined;
            const m = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (m) {
                pubDate = new Date(Number.parseInt(m[1]), Number.parseInt(m[2]) - 1, Number.parseInt(m[3]));
            }

            return {
                title,
                link,
                description: image ? `<img src="${image}"><br>${description}` : description,
                category,
                pubDate: pubDate && parseDate(pubDate),
            } as DataItem;
        })
        .filter((item) => item.title && item.link);

    return {
        title: 'GXNAS博客',
        link: rootUrl,
        item: items,
        description: 'GXNAS博客 - NAS博客|NAS社区|NAS交流|NAS技术|群晖教程|软路由',
    };
}
