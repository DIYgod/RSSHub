import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio'; // cheerio@1.0.0
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    tzgg: { title: '上海大学 - 通知公告', url: 'https://www.shu.edu.cn/tzgg.htm' },
    zyxw: { title: '上海大学 - 重要新闻', url: 'https://www.shu.edu.cn/zyxw.htm' },
};

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/shu/news/tzgg',
    parameters: { type: '分类，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.shu.edu.cn/'],
            target: '/news',
        },
    ],
    name: '官网通知公告',
    maintainers: ['lonelyion', 'GhhG123'],
    handler,
    url: 'www.shu.edu.cn/',
    description: `| 通知公告 | 重要新闻 |
  | -------- | --------- |
  | tzgg     | zyxw      |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const rootUrl = 'https://www.shu.edu.cn';

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: noticeType[type].url,
    });

    const $ = load(response.data);

    const list = $('div.list ul li') // 以下获取信息需要根据网页结构定制
        // For cheerio 1.x.x . The item parameter in the .map callback is now explicitly typed as a Cheerio<Element>, not just Element. --fixed
        .toArray()
        .map((el) => {
            const item = $(el); // Wrap `el` in a Cheerio object
            const rawLink = item.find('a').attr('href');
            return {
                title: item.find('p.bt').text().trim(),
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
                pubDate: timezone(parseDate(item.find('p.sj').text().trim(), 'YYYY.MM.DD'), +8),
                description: item.find('p.zy').text().trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('#vsb_content .v_news_content').html() || item.description;

                return item;
            })
        )
    );

    return {
        title: noticeType[type].title,
        description: noticeType[type].title,
        link: noticeType[type].url,
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: items,
    };
}
