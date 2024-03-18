import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://jwb.shu.edu.cn/';
const alias = new Map([
    ['notice', 'tzgg'], // 通知公告
    ['news', 'xw'], // 新闻动态
    ['policy', 'zcwj'], // 政策文件
]);

export const route: Route = {
    path: ['/jwc/:type?', '/jwb/:type?'],
    radar: [
        {
            source: ['www.shu.edu.cn/:type'],
            target: '/:type',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    description: `| 通知通告 | 新闻 | 政策文件 |
  | -------- | ---- | -------- |
  | notice   | news | policy   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'notice';
    const link = `https://jwb.shu.edu.cn/index/${alias.get(type) || type}.htm`;
    const respond = await got.get(link);
    const $ = load(respond.data);
    const title = $('title').text();
    const list = $('.only-list')
        .find('li')
        .slice(0, 10)
        .toArray()
        .map((ele) => ({
            title: $(ele).find('a').text(),
            link: new URL($(ele).find('a').attr('href'), host).href,
            date: $(ele).children('span').text(),
        }));

    const all = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);
                item.author = $('[id$=_lblUser]').text().trim();
                item.pubDate = parseDate(item.date, 'YYYY年MM月DD日');
                item.description = $('.v_news_content').html() || item.title;
                return item;
            })
        )
    );
    return {
        title,
        link,
        item: all,
    };
}
