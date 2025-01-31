import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const notice_type = {
    jx: { title: '中国科学技术大学 - 教学类通知', url: 'https://ustc.edu.cn/tzgg/jxltz.htm' },
    ky: { title: '中国科学技术大学 - 科研类通知', url: 'https://ustc.edu.cn/tzgg/kyltz.htm' },
    gl: { title: '中国科学技术大学 - 管理类通知', url: 'https://ustc.edu.cn/tzgg/glltz.htm' },
    fw: { title: '中国科学技术大学 - 服务类通知', url: 'https://ustc.edu.cn/tzgg/fwltz.htm' },
};

// 对防抓的措施
// function getCookie(ctx) {
//     const cache_key = `ustc-cookie-${new Date().toLocaleDateString()}`;
//     return cache.tryGet(cache_key, async () => {
//         const { headers } = await got('https://ustc.edu.cn/system/resource/code/datainput.jsp', {
//             headers: { 'user-agent': UA },
//         });
//         const cookie = headers['set-cookie']
//             .filter((c) => c.match(/(user_trace_token|X_HTTP_TOKEN)/))
//             .map((c) => c.split(';')[0])
//             .join('; ');
//         return cookie;
//     });
// }

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/ustc/news/gl',
    parameters: { type: '分类，默认为管理类' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ustc.edu.cn/'],
            target: '/news',
        },
    ],
    name: '官网通知公告',
    maintainers: ['hang333', 'jasongzy'],
    handler,
    url: 'ustc.edu.cn/',
    description: `| 教学类 | 科研类 | 管理类 | 服务类 |
| ------ | ------ | ------ | ------ |
| jx     | ky     | gl     | fw     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'gl';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: notice_type[type].url,
    });

    const $ = load(response.data);
    let items = $('table[portletmode=simpleList] > tbody > tr.light')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: $(child[1]).find('a').attr('title'),
                link: $(child[1]).find('a').attr('href').startsWith('../') ? new URL($(child[1]).find('a').attr('href'), notice_type[type].url).href : $(child[1]).find('a').attr('href'),
                pubDate: timezone(parseDate($(child[2]).text(), 'YYYY-MM-DD'), +8),
            };
            return info;
        })
        .get();

    items = await Promise.all(
        items
            .filter((item) => item.link)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const response = await got(item.link);
                        const $ = load(response.data);

                        item.description = $('div.v_news_content').html();
                    } catch {
                        // intranet contents
                    }
                    return item;
                })
            )
    );

    return {
        title: notice_type[type].title,
        description: notice_type[type].title,
        link: notice_type[type].url,
        item: items,
    };
}
