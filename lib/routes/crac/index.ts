import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?',
    categories: ['government'],
    example: '/crac/2',
    parameters: { type: '类型，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新资讯',
    maintainers: ['Misaka13514'],
    handler,
    description: `| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |
| -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |
| 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.crac.org.cn';
    const type = ctx.req.param('type');
    const link = type ? `${baseUrl}/News/List?type=${type}` : `${baseUrl}/News/List`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);
    const list = $('div.InCont_r_d_cont > li')
        .map((_, item) => {
            item = $(item);
            return {
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('span.cont_d').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(response.data);
                item.title = content('div.r_d_cont_title > h3').text();
                item.description = content('div.r_d_cont').html().trim().replaceAll('\n', '');
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
