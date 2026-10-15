import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:path{.+}?',
    categories: ['university'],
    example: '/cqu/jwc/index/tzgg',
    parameters: {
        path: {
            description: '路径参数，默认为 `index/tzgg`，也支持官网的 `index/tzgg.htm` 路径',
            default: 'index/tzgg',
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
            source: ['jwc.cqu.edu.cn/index/:filename'],
            target: '/jwc/index/:filename',
        },
    ],
    name: '本科教学信息网通知',
    maintainers: ['El-Chiang', 'Hagb', 'AhsokaTano26'],
    handler,
};

async function handler(ctx) {
    const { path = 'index/tzgg' } = ctx.req.param();
    const baseUrl = 'https://jwc.cqu.edu.cn';
    const url = `${baseUrl}/${path.replace(/\.htm$/, '')}.htm`;

    const { page, destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    let response: string;
    let cookieString: string;
    try {
        await page.waitForSelector('div.page-contner.fl li.pot-r a.no-wrap');
        response = await page.content();
        cookieString = (await page.context().cookies()).map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
    } finally {
        await destroy();
    }
    const $ = load(response);

    const list = $('div.page-contner.fl li.pot-r')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('a.no-wrap');
            const link = new URL(a.attr('href')!, url).href;
            return {
                title: a.attr('title')!,
                link,
                pubDate: timezone(parseDate($item.find('span.fr').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link, { headers: { Cookie: cookieString } });
                const $ = load(response);

                item.description = $('form[name="_newscontent_fromname"] div.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text().replace(/--/, ' - '),
        link: url,
        item: items,
    };
}
