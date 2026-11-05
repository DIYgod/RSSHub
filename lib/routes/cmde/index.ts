import { load } from 'cheerio';
import pMap from 'p-map';
import type { BrowserContext } from 'patchright';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

const rootURL = 'https://www.cmde.org.cn';

export const route: Route = {
    path: '/:cate{.+}?',
    categories: ['government'],
    example: '/cmde/xwdt/zxyw',
    parameters: { cate: '路径，默认为最新要闻' },
    name: '通用',
    maintainers: ['run-ze'],
    features: {
        requirePuppeteer: true,
    },
    handler,
    description: `路径处填写对应页面 URL 中 \`https://www.cmde.org.cn/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [最新要闻](https://www.cmde.org.cn/xwdt/zxyw/index.html) 则将对应页面 URL <https://www.cmde.org.cn/xwdt/zxyw/index.html> 中 \`https://www.cmde.org.cn/\` 和 \`/index.html\` 之间的字段 \`xwdt/zxyw\` 作为路径填入。此时路由为 [\`/cmde/xwdt/zxyw\`](https://rsshub.app/cmde/xwdt/zxyw)`,
};

async function getPageHtml(context: BrowserContext, url: string, selector: string) {
    const page = await context.newPage();
    try {
        await page.route('**/*', async (route) => {
            const type = route.request().resourceType();
            await (['document', 'script'].includes(type) ? route.continue() : route.abort());
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(selector);
        return await page.content();
    } finally {
        await page.close();
    }
}

async function handler(ctx) {
    const cate = ctx.req.param('cate') ?? 'xwdt/zxyw';
    const url = `${rootURL}/${cate}/`;
    const context = await playwright();
    try {
        const data = await cache.tryGet(url, async () => {
            const html = await getPageHtml(context, url, '.list');
            const $ = load(html);
            return {
                title: $('head title').text(),
                description: $('meta[name=ColumnDescription]').attr('content'),
                items: $('.list ul li')
                    .toArray()
                    .map((item): DataItem & { link: string } => {
                        const $item = $(item);
                        return {
                            title: $item.find('a').attr('title')!,
                            link: new URL($item.find('a').attr('href')!, url).href,
                        };
                    }),
            };
        });

        const items = await pMap(
            data.items,
            (item) =>
                cache.tryGet(item.link, async () => {
                    const html = await getPageHtml(context, item.link, '.text');
                    const $ = load(html);
                    item.description = $('.text').html();
                    item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')!), 8);
                    return item;
                }),
            { concurrency: 3 }
        );

        return {
            title: data.title,
            description: data.description,
            link: url,
            item: items,
        };
    } finally {
        await context.close();
    }
}
