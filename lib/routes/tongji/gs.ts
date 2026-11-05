import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

class ArticleBodyUnavailableError extends Error {}

export const route: Route = {
    path: '/gs',
    categories: ['university'],
    example: '/tongji/gs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gs.tongji.edu.cn/tzgg.htm', 'gs.tongji.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sitdownkevin'],
    handler,
    url: 'gs.tongji.edu.cn/tzgg.htm',
};
async function getNoticeContent(link: string, getBrowserContent: (url: string) => Promise<string>) {
    const response = await got(link);
    let $ = load(response.body);
    if (new URL(link).origin === 'https://mp.weixin.qq.com' && $('#js_verify').length) {
        const source = await getBrowserContent(link);
        $ = load(source);
    }
    const main = $('.v_news_content').first();
    const content = main.length ? main : $('#vsb_content, #js_content').first();
    if (!content.text().trim() && !content.find('img, video, iframe, a[href]').length) {
        throw new ArticleBodyUnavailableError('The source notice does not expose a public article body.');
    }
    content.find('img[data-src]').each((_, element) => {
        $(element).attr('src', $(element).attr('data-src')!);
    });
    const attachments = mapElements(
        content
            .closest('form')
            .find('ul')
            .filter((_, element) => content.toArray().every((node) => !$.contains(node, element)) && $(element).find('a[href*="news.DownloadAttachUrl"]').length > 0),
        (_, element) => $.html(element)
    ).join('');
    return { description: (content.html() ?? '') + attachments };
}
async function handler() {
    const baseUrl = 'https://gs.tongji.edu.cn';
    const response = await got(`${baseUrl}/tzgg.htm`);
    const $ = load(response.body);
    const container = $('body > div > div.con_list.ma0a > div > div.list_content_right > div.list_list > ul');
    const items = container
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').attr('title')!;
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw!.startsWith('http') ? linkRaw : `${baseUrl}/${linkRaw}`;
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) };
        });
    let browserPromise: ReturnType<typeof getPlaywrightPage> | undefined;
    const getBrowserContent = async (url: string) => {
        browserPromise ??= getPlaywrightPage(url, {
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
            await page.waitForSelector('#js_content', { state: 'attached', timeout: 15000 });
            return await page.content();
        } catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new ArticleBodyUnavailableError('WeChat still requires source access verification.');
            }
            throw error;
        } finally {
            await page.close();
        }
    };
    try {
        const itemsWithContent = await pMap(
            items,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`tongji:gs:public-body:v1:${item.link}`, () => getNoticeContent(item.link!, getBrowserContent));
                    return { ...item, ...detail };
                } catch (error) {
                    if (error instanceof ArticleBodyUnavailableError) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        );
        return {
            title: '同济大学研究生院',
            link: baseUrl,
            description: '同济大学研究生院通知公告',
            image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
            icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
            logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
            item: itemsWithContent,
        };
    } finally {
        await (await browserPromise)?.destroy();
    }
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
