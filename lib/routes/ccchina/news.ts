import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { URL } from 'node:url';
import puppeteer from '@/utils/puppeteer';
const rootUrl = 'https://www.ccchina.org.cn';

async function handler() {
    const browser = await puppeteer();

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(`${rootUrl}/list.aspx?clmId=57`, {
        waitUntil: 'networkidle0',
    });
    const list = (
        await page.evaluate(() =>
            [...document.querySelectorAll('.list2 > li')].map((item) => {
                const a = item.querySelector('a');
                const span = item.querySelector('font');
                if (a && span) {
                    return {
                        title: a.getAttribute('title'),
                        link: a.href,
                        pubDate: span.textContent,
                    };
                }
                return null;
            })
        )
    ).filter(Boolean) as {
        title: string;
        link: string;
        pubDate: string;
    }[];
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.goto(item.link, {
                    waitUntil: 'networkidle0',
                });
                const description = await page.evaluate(() => {
                    const element = document.querySelector('.article_details_body');
                    if (element) {
                        for (const el of element.querySelectorAll('*')) {el.removeAttribute('style');}
                        return element.innerHTML;
                    }
                    return '';
                });
                await page.close();

                return {
                    ...item,
                    description,
                    pubDate: parseDate(item.pubDate.replaceAll(/\[|\]/g, '')),
                };
            })
        )
    );
    await browser.close();
    return {
        title: `CCCHINA `,
        link: rootUrl,
        item: items,
    };
}

export const route: Route = {
    path: '/news',
    categories: ['government'],
    example: '/ccchina/news',
    name: '国内新闻',
    maintainers: ['lijhdev'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportRadar: true,
    },
    handler,
    radar: [
        {
            source: ['www.ccchina.org.cn/list.aspx'],
            target: (params, urlString) => {
                const url = new URL(urlString);
                const clmId = url.searchParams.get('clmId');
                if (clmId === '57') {
                    return '/ccchina/news';
                }
                return '';
            },
        },
    ],
};
