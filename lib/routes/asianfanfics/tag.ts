import { DataItem, Route } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

// test url http://localhost:1200/asianfanfics/tag/milklove/N

export const route: Route = {
    path: '/tag/:tag/:type',
    categories: ['reading'],
    example: '/tag/milklove/N',
    parameters: {
        tag: '标签',
        type: '排序类型',
    },
    name: '亚洲同人网标签',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/tag/:tag/:type'],
            target: '/tag/:tag/:type',
        },
    ],
    description: `匹配亚洲同人网标签，支持类型：
- L: Latest 最近更新
- N: Newest 最近发布
- O: Oldest 最早发布
- C: Completed 已完成
- OS: One Shots 短篇
`,
    handler,
    features: {
        requirePuppeteer: true,
    },
};

type Type = 'L' | 'N' | 'O' | 'C' | 'OS';

const typeToText = {
    L: '最近更新',
    N: '最近发布',
    O: '最早发布',
    C: '已完成',
    OS: '短篇',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    let type = ctx.req.param('type') as Type;
    if (!type || !['L', 'N', 'O', 'C', 'OS'].includes(type)) {
        type = 'L';
    }
    const link = `https://www.asianfanfics.com/browse/tag/${tag}/${type}`;

    // require puppeteer utility class and initialise a browser instance
    const browser = await puppeteer();
    // open a new tab
    const page = await browser.newPage();
    // intercept all requests
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        // in this case, we only allow document requests to proceed
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // ofetch requests will be logged automatically
    // but puppeteer requests are not
    // so we need to log them manually
    logger.http(`Requesting ${link}`);

    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'domcontentloaded',
    });
    // retrieve the HTML content of the page
    const response = await page.content();
    // close the tab
    page.close();

    const $ = load(response);

    const items: DataItem[] = $('.primary-container .excerpt')
        .toArray()
        .filter((element) => {
            const $element = $(element);
            return $element.find('.excerpt__title a').length > 0;
        })
        .map((element) => {
            const $element = $(element);
            const title = $element.find('.excerpt__title a').text();
            const link = 'https://www.asianfanfics.com' + $element.find('.excerpt__title a').attr('href');
            const author = $element.find('.excerpt__meta__name a').text().trim();
            const pubDate = parseDate($element.find('time').attr('datetime') || '');

            return {
                title,
                link,
                author,
                pubDate,
            };
        });

    // don't forget to close the browser instance at the end of the function
    browser.close();

    return {
        title: `Asianfanfics 亚洲同人网 - 标签：${tag} - ${typeToText[type]}`,
        link,
        item: items,
    };
}
