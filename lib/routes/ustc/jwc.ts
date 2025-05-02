import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const noticeUrl = 'https://www.teach.ustc.edu.cn/category/notice';
const noticeType = { teaching: '教学', info: '信息', exam: '考试', exchange: '交流' };

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/ustc/jwc/info',
    parameters: { type: '分类，默认显示所有种类' },
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
            source: ['www.teach.ustc.edu.cn/'],
            target: '/jwc',
        },
    ],
    name: '教务处通知新闻',
    maintainers: ['hang333'],
    handler,
    url: 'www.teach.ustc.edu.cn/',
    description: `| 信息 | 教学     | 考试 | 交流     |
| ---- | -------- | ---- | -------- |
| info | teaching | exam | exchange |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
        }, */
        url: `${noticeUrl}${type === '' ? '' : '-' + type}`,
    });

    const $ = load(response.data);
    let items = $(type === '' ? 'ul[class="article-list with-tag"] > li' : 'ul[class=article-list] > li')
        .toArray()
        .map((element) => {
            const child = $(element).children();
            const info = {
                title: type === '' ? $(child[0]).find('a').text() + ' - ' + $(child[1]).find('a').text() : $(child[0]).find('a').text(),
                link: type === '' ? $(child[1]).find('a').attr('href') : $(child[0]).find('a').attr('href'),
                pubDate: timezone(parseDate($(element).find('.date').text().trim(), 'YYYY-MM-DD'), +8),
            };
            return info;
        });

    items = await Promise.all(
        items
            .filter((item) => item.link)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    // www.teach ?? pms.cmet ?? news
                    item.description = $('main[class=single]').html() ?? $('.card-footer').html() ?? $('.v_news_content').html();
                    item.pubDate = $('li[class=meta-date]').text() ? timezone(parseDate($('li[class=meta-date]').text(), 'YYYY-MM-DD HH:mm'), +8) : item.pubDate;
                    return item;
                })
            )
    );

    const desc = type === '' ? '中国科学技术大学教务处 - 通知新闻' : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;

    return {
        title: desc,
        description: desc,
        link: `${noticeUrl}${type === '' ? '' : '-' + type}`,
        item: items,
    };
}
