import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

export const route: Route = {
    path: '/news/:options?',
    categories: ['game'],
    example: '/fortnite/news',
    parameters: { options: 'Params' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['lyqluis'],
    handler,
    description: `-   \`options.lang\`, optional, language, eg. \`/fortnite/news/lang=en-US\`, common languages are listed below, more languages are available one the [official website](https://www.fortnite.com/news)

| English (default) | Spanish | Japanese | French | Korean | Polish |
| ----------------- | ------- | -------- | ------ | ------ | ------ |
| en-US             | es-ES   | ja       | fr     | ko     | pl     |`,
};

async function handler(ctx) {
    const options = ctx.req
        .param('options')
        ?.split('&')
        .map((op) => op.split('='));

    const rootUrl = 'https://www.fortnite.com';
    const path = 'news';
    const language = options?.find((op) => op[0] === 'lang')[1] ?? 'en-US';
    const link = `${rootUrl}/${path}?lang=${language}`;
    const apiUrl = `https://www.fortnite.com/api/blog/getPosts?category=&postsPerPage=0&offset=0&locale=${language}&rootPageSlug=blog`;

    // Use Playwright instead of got, which may be blocked by anti-crawling scripts with response code 403.
    const browser = await playwright();
    const page = await browser.newPage();

    // intercept all requests
    await page.setRequestInterception(true);
    // only document is allowed
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    // log manually (necessary for Playwright)
    logger.http(`Requesting ${apiUrl}`);
    let data;
    try {
        const response = await page.goto(apiUrl, {
            waitUntil: 'networkidle0',
        });
        if (!response) {
            throw new Error(`No response received from ${apiUrl}`);
        }
        if (!response.ok()) {
            const statusText = response.statusText();
            const statusMessage = [response.status(), statusText].filter(Boolean).join(' ');
            throw new Error(`Fortnite API responded with ${statusMessage} for ${apiUrl}`);
        }
        const contentType = response.headers()['content-type'];
        if (!contentType?.includes('application/json')) {
            throw new Error(`Fortnite API returned non-JSON response with content-type ${contentType ?? 'unknown'}`);
        }

        data = await response.json();
    } finally {
        await page.close();
        await browser.close();
    }

    const { blogList: list } = data;

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, () => ({
                title: item.title,
                link: `${rootUrl}/${path}/${item.slug}?lang=${language}`,
                pubDate: parseDate(item.date),
                author: item.author,
                description: item.content, // includes <img /> & full text
            }))
        )
    );

    return {
        title: 'Fortnite News',
        link,
        item: items,
    };
}
