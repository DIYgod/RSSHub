import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const host = 'https://yjsy.cjlu.edu.cn/';

const titleMap = new Map([
    ['yjstz', '中量大研究生院 —— 研究生通知'],
    ['jstz', '中量大研究生院 —— 教师通知'],
]);

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
| ---------- | -------- |
| yjstz      | jstz     |`,
};

async function handler(ctx) {
    const cate = ctx.req.param('cate');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;
    const url = `${host}index/${cate}.htm`;

    const { page, destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                allowedResourceTypes.has(request.resourceType()) ? route.continue() : route.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle' },
    });

    const cookies = await page.context().cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const response = await page.content();
    await destroy();

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
                pubDate: timezone(parseDate(timeStr, 'YYYY/MM/DD'), 8),
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
        title: titleMap.get(cate)!,
        link: `https://yjsy.cjlu.edu.cn/index/${cate}.htm`,
        item: items,
    };
}
