import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://jwb.shu.edu.cn/';
const alias = new Map([
    ['notice', 'tzgg'], // 通知公告
    ['news', 'xw'], // 新闻动态
    /* ['policy', 'zcwj'],  政策文件 //BUG */
]);

export const route: Route = {
    path: ['/jwb/:type?'],
    radar: [
        {
            source: ['www.shu.edu.cn/index'],
            target: '/:type?',
        },
    ],
    name: '教务部',
    maintainers: ['tuxinghuan', 'GhhG123'],
    handler,
    description: `| 通知通告 | 新闻 | 政策文件(bug) |
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
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: all,
    };
}
