import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

export const route: Route = {
    path: '/shxyj/:year?/:issue?',
    categories: ['journal'],
    example: '/ajcass/shxyj/2024/1',
    parameters: { year: 'Year of the issue, `null` for the lastest', issue: 'Issue number, `null` for the lastest' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '社会学研究',
    maintainers: ['CNYoki'],
    handler,
};

async function getPageHtml(page: Page, url: string, selector: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(selector);
    return page.content();
}

async function handler(ctx) {
    const { page, destroy } = await getPlaywrightPage('https://shxyj.ajcass.com/', {
        noGoto: true,
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        let { year, issue } = ctx.req.param();

        if (!year) {
            const response = await getPageHtml(page, 'https://shxyj.ajcass.com/', 'p.hod.pop');
            const $ = load(response);
            const latestIssueText = $('p.hod.pop').first().text();

            const match = latestIssueText.match(/(\d{4}) Vol\.(\d+):/);
            if (match) {
                year = match[1];
                issue = match[2];
            } else {
                throw new Error('无法获取最新的 year 和 issue');
            }
        }

        const url = `https://shxyj.ajcass.com/Magazine/?Year=${year}&Issue=${issue}`;
        const response = await getPageHtml(page, url, '#tab');
        const $ = load(response);

        const items = $('#tab tr')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const articleTitle = $item.find('a').first().text().trim();
                const articleLink = $item.find('a').first().attr('href');
                const summary = $item.find('li').eq(1).text().replace('[摘要]', '').trim();
                const authors = $item.find('li').eq(2).text().replace('作者：', '').trim();

                if (articleTitle && articleLink) {
                    return {
                        title: articleTitle,
                        link: `https://shxyj.ajcass.com${articleLink}`,
                        description: summary,
                        author: authors,
                    };
                }
                return null;
            })
            .filter((item) => item !== null);

        return {
            title: `社会学研究 ${year}年第${issue}期`,
            link: url,
            item: items,
        };
    } finally {
        await destroy();
    }
}
