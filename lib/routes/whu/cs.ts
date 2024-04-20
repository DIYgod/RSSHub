import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

const baseUrl = 'https://cs.whu.edu.cn';

export const route: Route = {
    path: '/cs/:type',
    categories: ['university'],
    example: '/whu/cs/2',
    parameters: { type: '公告类型，详见表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院公告',
    maintainers: ['ttyfly'],
    handler,
    description: `| 公告类型 | 学院新闻 | 学术交流 | 通知公告 | 科研进展 |
  | -------- | -------- | -------- | -------- | -------- |
  | 参数     | 0        | 1        | 2        | 3        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));

    let link;
    switch (type) {
        case 0:
            link = `${baseUrl}/xwdt/xyxw.htm`; // 学院新闻

            break;

        case 1:
            link = `${baseUrl}/kxyj/xsjl.htm`; // 学术交流

            break;

        case 2:
            link = `${baseUrl}/xwdt/tzgg.htm`; // 通知公告

            break;

        case 3:
            link = `${baseUrl}/kxyj/kyjz.htm`; // 科研进展

            break;

        default:
            throw new Error(`Unknown type: ${type}`);
    }

    const response = await got(link);
    const $ = load(response.data);

    const list = $('div.study ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a p').text().trim(),
                pubDate: parseDate(item.find('span').text()),
                link: new URL(item.find('a').attr('href'), link).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                if ($('.prompt').length) {
                    item.description = $('.prompt').html();
                    return item;
                }

                const content = $('.content');

                content.find('img').each((_, e) => {
                    e = $(e);
                    if (e.attr('orisrc')) {
                        e.attr('src', new URL(e.attr('orisrc'), response.url).href);
                        e.removeAttr('orisrc');
                        e.removeAttr('vurl');
                    }
                });

                item.description = content.html();
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8) : item.pubDate;

                return item;
            })
        )
    );

    return {
        title: $('title').first().text(),
        link,
        item: items,
    };
}
