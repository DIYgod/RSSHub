import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';
import timezone from '@/utils/timezone';

const host = 'https://yjsy.cjlu.edu.cn/';

const titleMap = new Map([
    ['yjstz', '中量大研究生院 —— 研究生通知'],
    ['jstz', '中量大研究生院 —— 教师通知'],
]);
const headers = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    Referer: 'https://yjsy.cjlu.edu.cn',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
    'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};

const allowedResourceTypes = new Set(['document', 'script']);

export const route: Route = {
    path: '/yjsy/:cate',
    categories: ['university'],
    example: '/cjlu/yjsy/yjstz',
    parameters: {
        cate: {
            description: '订阅的类型，支持 yjstz（研究生通知）和 jstz（教师通知）',
            default: 'yjstz',
            options: [
                {
                    label: '教师通知',
                    value: 'jstz',
                },
                {
                    label: '研究生通知',
                    value: 'yjstz',
                },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '研究生通知',
            source: ['yjsy.cjlu.edu.cn/index/yjstz/:suffix', 'yjsy.cjlu.edu.cn/index/yjstz.htm'],
            target: '/yjsy/yjstz',
        },
        {
            title: '教师通知',
            source: ['yjsy.cjlu.edu.cn/index/jstz/:suffix', 'yjsy.cjlu.edu.cn/index/jstz.htm'],
            target: '/yjsy/jstz',
        },
    ],
    name: '研究生院',
    maintainers: ['chrisis58'],
    handler,
    description: `| 研究生通知 | 教师通知 |
| -------- | -------- |
| yjstz    | jstz     |`,
};

async function handler(ctx) {
    const cate = ctx.req.param('cate');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const url = `${host}index/${cate}.htm`;

    const { page, destory, browser } = await getPuppeteerPage(url, {
        onBeforeLoad: async (page) => {
            await page.setExtraHTTPHeaders(headers);
            await page.setUserAgent(headers['User-Agent']);
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowedResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle2' },
    });

    const cookies = await browser.cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const response = await page.content();
    await destory();

    const $ = load(response);

    const list = $('div.grid685.right div.body ul')
        .find('li')
        .toArray()
        .slice(0, limit)
        .map((element) => {
            const item = $(element);

            const a = item.find('a').first();

            const timeStr = item.find('span').first().text().trim();
            const href = a.attr('href') ?? '';
            const route = href.startsWith('../') ? href.replace(/^\.\.\//, '') : href;

            return {
                title: a.attr('title') ?? titleMap.get(cate) ?? '中量大研究生院通知',
                pubDate: timezone(parseDate(timeStr, 'YYYY/MM/DD'), +8),
                link: `${host}${route}`,
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link || item.link === host) {
                    return item;
                }

                const res = await ofetch(item.link, {
                    responseType: 'text',
                    headers: {
                        ...headers,
                        Cookie: cookieString,
                        Referer: url,
                    },
                });
                const $ = load(res);

                const content = $('#vsb_content').html() ?? '';
                const attachments = $('form[name="_newscontent_fromname"] div ul').html() ?? '';

                item.description = `${content}<br>${attachments}`;
                return item;
            })
        )
    );

    return {
        title: titleMap.get(cate),
        link: `https://yjsy.cjlu.edu.cn/index/${cate}.htm`,
        item: items,
    };
}
