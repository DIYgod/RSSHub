import { load } from 'cheerio';
import type { Context } from 'hono';
import iconv from 'iconv-lite';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.csc.edu.cn';

const typeMap = {
    lxtz: {
        name: '遴选通知',
        url: '/chuguo/list/24',
    },
    xmzl: {
        name: '综合项目专栏',
        url: '/chuguo/list/26',
    },
    wtjd: {
        name: '常见问题解答',
        url: '/chuguo/list/27',
    },
    lqgg: {
        name: '录取公告',
        url: '/chuguo/list/28',
    },
    xwzx: {
        name: '新闻资讯',
        url: '/news',
    },
    xwgg: {
        name: '新闻公告',
        url: '/news/gonggao',
    },
};

export const route: Route = {
    path: '/notice/:type?',
    categories: ['study'],
    example: '/csc/notice/lxtz',
    parameters: {
        type: {
            description: '分类',
            default: 'lxtz',
            options: Object.entries(typeMap).map(([value, { name }]) => ({ value, label: name })),
        },
    },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '通知',
    maintainers: ['Derekmini', 'markmingjie'],
    handler,
    url: 'www.csc.edu.cn',
    description: `| 遴选通知 | 综合项目专栏 | 常见问题解答 | 录取公告 | 新闻资讯 | 新闻公告 |
| -------- | ------------ | ------------ | -------- | -------- | -------- |
| lxtz     | xmzl         | wtjd         | lqgg     | xwzx     | xwgg     |`,
};

async function handler(ctx: Context): Promise<Data> {
    const { type = 'lxtz' } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? 10);
    const link = baseUrl + typeMap[type as keyof typeof typeMap].url;
    const { page, destroy } = await getPlaywrightPage(link, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
        gotoConfig: { waitUntil: 'domcontentloaded' },
    });
    await page.waitForSelector('.list-a li');
    const html = await page.content();
    const cookies = await page.context().cookies();
    await destroy();
    const headers = { cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') };
    const $ = load(html);

    const list = $('.list-a li')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');

            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!, { responseType: 'arrayBuffer', headers });
                const $ = load(iconv.decode(Buffer.from(response), 'gbk'));
                item.description = $('.contents').html();
                return item;
            })
        )
    );

    return {
        title: `${$('title').text().split('-', 1)[0].trim()} - 国家留学网`,
        link,
        language: 'zh-CN',
        item: out,
    };
}
