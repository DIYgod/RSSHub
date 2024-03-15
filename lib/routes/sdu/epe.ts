import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.epe.sdu.edu.cn/';
const typelist = ['学院动态', '通知公告', '学术论坛'];
const urlList = ['zxzx/xydt.htm', 'zxzx/tzgg.htm', 'zxzx/xslt.htm'];

export const route: Route = {
    path: '/epe/:type?',
    categories: ['university'],
    example: '/sdu/epe/0',
    parameters: { type: '默认为 `0`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '能源与动力工程学院通知',
    maintainers: ['Ji4n1ng'],
    handler,
    description: `| 学院动态 | 通知公告 | 学术论坛 |
  | -------- | -------- | -------- |
  | 0        | 1        | 2        |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? Number.parseInt(ctx.req.param('type')) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = load(response.data);

    let item = $('#page_right_main li a')
        .map((_, e) => {
            e = $(e);
            return {
                title: e.attr('title'),
                link: e.attr('href'),
            };
        })
        .get();

    item = await Promise.all(
        item
            .filter((e) => e.link.startsWith('../info'))
            .map((item) => {
                item.link = new URL(item.link.slice('3'), host).href;
                return cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    const info = $('#show_info').text().split(/\s{4}/);
                    const date = info[0].split('：')[1];

                    item.title = $('#show_title').text().trim();
                    item.author = info[1].replace('编辑：', '') || '山东大学能源与动力工程学院';
                    item.description = $('#show_content').html();
                    item.pubDate = timezone(parseDate(date), +8);

                    return item;
                });
            })
    );

    return {
        title: `山东大学能源与动力工程学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
}
