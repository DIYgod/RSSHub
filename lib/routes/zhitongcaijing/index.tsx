import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const ids = {
    recommend: {
        url: 'content/recommend',
        title: '推荐',
    },
    hkstock: {
        url: 'content/hkstock',
        title: '港股',
    },
    meigu: {
        url: 'content/meigu',
        title: '美股',
    },
    agu: {
        url: 'content/agu',
        title: '沪深',
    },
    ct: {
        url: 'content/ct',
        title: '创投',
    },
    esg: {
        url: 'content/esg',
        title: 'ESG',
    },
    aqs: {
        url: 'content/aqs',
        title: '券商',
    },
    ajj: {
        url: 'content/ajj',
        title: '基金',
    },
    focus: {
        url: 'focus',
        title: '要闻',
    },
    announcement: {
        url: 'announcement',
        title: '公告',
    },
    research: {
        url: 'research',
        title: '研究',
    },
    shares: {
        url: 'shares',
        title: '新股',
    },
    bazaar: {
        url: 'bazaar',
        title: '市场',
    },
    company: {
        url: 'company',
        title: '公司',
    },
};

function isVerificationPage(data?: string) {
    if (typeof data !== 'string') {
        return false;
    }

    const $ = load(data);
    return /^\s*check\(\)\s*;?$/.test($('body').attr('onload') ?? '') && $('input[name="parm_0"]').length > 0 && $('input[name="parm_1"]').length > 0;
}

export const route: Route = {
    path: '/:id?/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/zhitongcaijing',
    parameters: { id: '栏目 id，可在对应栏目页 URL 中找到，默认为 recommend，即推荐', category: '分类 id，可在对应栏目子分类页 URL 中找到，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '推荐',
    maintainers: ['nczitzk'],
    handler,
    description: `| id           | 栏目 |
| ------------ | ---- |
| recommend    | 推荐 |
| hkstock      | 港股 |
| meigu        | 美股 |
| agu          | 沪深 |
| ct           | 创投 |
| esg          | ESG  |
| aqs          | 券商 |
| ajj          | 基金 |
| focus        | 要闻 |
| announcement | 公告 |
| research     | 研究 |
| shares       | 新股 |
| bazaar       | 市场 |
| company      | 公司 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'recommend';
    const category = ctx.req.param('category') ?? '';

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://www.zhitongcaijing.com';
    const currentUrl = `${rootUrl}/${ids[id].url}.html${category === '' ? '' : `?category_key=${category}`}`;
    const apiUrl = `${rootUrl}/${ids[id].url}.html?data_type=1&page=1${category === '' ? '' : `&category_key=${category}`}`;

    let browserPromise: ReturnType<typeof getPlaywrightPage> | undefined;
    const getBrowserContent = async (url: string, json = false) => {
        browserPromise ??= getPlaywrightPage(apiUrl, {
            noGoto: true,
            closeTimeout: 0,
            onBeforeLoad: async (_, context) => {
                await context!.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            },
        });
        const { context } = await browserPromise;
        const page = await context.newPage();
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            if (json) {
                await page.waitForFunction(
                    () => {
                        try {
                            return typeof JSON.parse(document.body.textContent ?? '') === 'object';
                        } catch {
                            return false;
                        }
                    },
                    undefined,
                    { timeout: 15000 }
                );
                return (await page.locator('body').textContent()) ?? '';
            }
            await page.waitForSelector('.telegram-origin-contentn, .news-body-content', { state: 'attached', timeout: 15000 });
            return await page.content();
        } finally {
            await page.close();
        }
    };

    try {
        const response = await got({
            method: 'get',
            url: apiUrl,
        });
        const data = isVerificationPage(response.data) ? JSON.parse(await getBrowserContent(apiUrl, true)) : response.data;
        if (data?.status !== 'success' || !Array.isArray(data.data)) {
            throw new TypeError('Zhitong Caijing did not return a successful article list.');
        }

        const list: Array<DataItem & { link: string }> = data.data.slice(0, limit).map((item) => ({
            title: item.title,
            link: `${rootUrl}${item.url}`,
            description: item.digest,
            author: item.author_info.author_name,
            pubDate: parseDate((item.create_time ?? Number.parseInt(item.original_time)) * 1000),
            category: [...(item.keywords?.split(',') ?? []), item.category_name ?? item.type_tag],
        }));

        const items = await pMap(
            list,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`zhitongcaijing:article:v1:${item.link}`, async () => {
                        let source: string;
                        if (browserPromise) {
                            source = await getBrowserContent(item.link);
                        } else {
                            const detailResponse = await got(item.link);
                            source = isVerificationPage(detailResponse.data) ? await getBrowserContent(item.link) : detailResponse.data;
                        }
                        const content = load(source);

                        content('#subscribe-vip-box').remove();
                        content('#news-content').remove();

                        const main = content('.news-body-content').first();
                        const article = main.length ? main : content('.telegram-origin-contentn').first();
                        if (!article.text().trim() && !article.find('img, video, audio, iframe, pre, table').length) {
                            throw new CaptchaError('Zhitong Caijing did not expose an article body; verify access to the article on the source website.');
                        }
                        const digest = content('.digetst-box').html();
                        const description = article.html();
                        const body = renderToString(
                            <>
                                {digest ? raw(digest) : null}
                                {description ? raw(description) : null}
                            </>
                        );

                        return { description: body };
                    });
                    return { ...item, ...detail };
                } catch (error) {
                    if (error instanceof CaptchaError || (error instanceof Error && error.name === 'TimeoutError')) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: `智通财经 - ${ids[id].title}`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await (await browserPromise)?.destroy();
    }
}
