import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/bupt/jwc/tzgg',
    parameters: {
        type: {
            description: '信息类型，可选值：tzgg（通知公告），xwzx（新闻资讯）',
        },
    },
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
            source: ['jwc.bupt.edu.cn/tzgg1.htm'],
            target: '/jwc/tzgg',
        },
        {
            source: ['jwc.bupt.edu.cn/xwzx2.htm'],
            target: '/jwc/xwzx',
        },
    ],
    name: '教务处',
    maintainers: ['Yoruet'],
    handler,
    url: 'jwc.bupt.edu.cn',
};

async function handler(ctx: Context) {
    let type = ctx.req.param('type'); // Default to notices when the type is absent.
    if (!type) {
        type = 'tzgg';
    }
    const rootUrl = 'https://jwc.bupt.edu.cn';
    let currentUrl;
    let pageTitle;

    if (type === 'tzgg') {
        currentUrl = `${rootUrl}/tzgg1.htm`;
        pageTitle = '通知公告';
    } else if (type === 'xwzx') {
        currentUrl = `${rootUrl}/xwzx2.htm`;
        pageTitle = '新闻资讯';
    } else {
        throw new Error('Invalid type parameter');
    }

    const { context, page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (request) => (['document', 'script'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 12000 });
        const pageContent = await page.content();
        const $ = load(pageContent);

        const list = $('.txt-elise')
            .toArray()
            .map((item): (DataItem & { link: string }) | null => {
                const $item = $(item);
                const $link = $item.find('a');
                // Skip elements without links or with empty href
                if ($link.length === 0 || !$link.attr('href')) {
                    return null;
                }
                return {
                    title: $link.contents().not('span').text(),
                    link: rootUrl + '/' + $link.attr('href'),
                    pubDate: timezone(parseDate($link.find('span').text(), 'YYYY-MM-DD'), 8),
                };
            })
            .filter((item) => item !== null);
        const orderedList = list;
        const entries = orderedList;
        const items = await Promise.all(
            entries.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await context.request.get(item.link, { timeout: 12000 });
                    const detailContent = await detailResponse.text();
                    const content = load(detailContent);

                    item.description = content('.v_news_content').html();

                    return item;
                })
            )
        );

        return {
            title: `北京邮电大学教务处 - ${pageTitle}`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}
