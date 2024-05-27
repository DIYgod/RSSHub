import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const baseUrl = 'https://jw.dhu.edu.cn';

const map = {
    student: '/tzggwxszl/list.htm',
    teacher: '/tzggwjszl/list.htm',
    class: '/tzggwxkzl_19850/list.htm',
    fxzy: '/fxzy/list.htm',
};
export const route: Route = {
    path: '/jiaowu/news/:type?',
    categories: ['university'],
    example: '/dhu/jiaowu/news/student',
    parameters: { type: '默认为 `student`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处通知',
    maintainers: ['KiraKiseki'],
    handler,
    description: `| 学生专栏 | 教师专栏 | 选课专栏（仅选课期间开放） | 辅修专业 |
  | -------- | -------- | -------- | -------- |
  | student  | teacher  | class    | fxzy     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'student';
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);

    // article list
    const articleList = $('.list2 > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const news_title = item.find('.news_title > a');
            const news_meta = item.find('.news_meta');

            const link = news_title.attr('href');
            const title = news_title.text();
            const pubDate = parseDate(news_meta.text(), 'YYYY-MM-DD', 'zh-cn');
            return {
                title,
                link,
                pubDate,
                description: '',
            };
        });

    // fetch article content
    const items = await Promise.all(
        articleList.map(async (item) => {
            const url = `${baseUrl}${item.link}`;
            await cache.tryGet(url, async () => {
                // some contents are only available for internal network
                try {
                    const { data: response } = await got(url);
                    const $ = load(response);
                    const description = $('.wp_articlecontent').first().html();
                    item.description = description ?? '';
                } catch {
                    item.description = '';
                }
                return item;
            });
            return item;
        })
    );

    return {
        title: '东华大学教务处-' + $('.col_title').text(),
        link,
        item: items,
    };
}
