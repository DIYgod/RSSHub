import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';
import { config } from '@/config';
import { getPuppeteerPage } from '@/utils/puppeteer';

const host = 'https://yjsy.cjlu.edu.cn/';

const titleMap = new Map([
    ['yjstz', '中量大研究生院 —— 研究生通知'],
    ['jstz', '中量大研究生院 —— 教师通知'],
]);

const excludeResourceTypes = new Set(['image', 'stylesheet']);

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
    const url = `${host}index/${cate}.htm`;

    const { page, destory, browser } = await getPuppeteerPage(url, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                excludeResourceTypes.has(request.resourceType()) ? request.abort() : request.continue();
            });
        },
        gotoConfig: { waitUntil: 'networkidle0' },
    });

    const cookies = await browser.cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const response = await page.content();
    await destory();

    const $ = load(response);

    const list = $('div.grid685.right div.body ul')
        .find('li')
        .toArray()
        .map((element) => {
            const item = $(element);

            const a = item.find('a').first();

            const timeStr = item.find('span').first().text().trim();
            const href = a.attr('href') ?? '';
            const route = href.startsWith('../') ? href.replace(/^\.\.\//, '') : href;

            return {
                title: a.attr('title') ?? titleMap.get(cate),
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
                        Cookie: cookieString,
                        'User-Agent': config.ua,
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
