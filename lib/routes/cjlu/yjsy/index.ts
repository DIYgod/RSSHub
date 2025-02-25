import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

const host = 'https://yjsy.cjlu.edu.cn/';

const titleMap = new Map([
    ['yjstz', '中量大研究生院 —— 研究生通知'],
    ['jstz', '中量大研究生院 —— 教师通知'],
]);

export const route: Route = {
    path: '/yjsy/:cate',
    categories: ['university'],
    example: '/cjlu/yjsy/yjstz',
    parameters: {
        cate: '订阅的类型，支持 yjstz（研究生通知）和 jstz（教师通知）',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
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

    const response = await ofetch(`${cate}.htm`, {
        baseURL: `${host}/index/`,
        responseType: 'text',
    });

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
