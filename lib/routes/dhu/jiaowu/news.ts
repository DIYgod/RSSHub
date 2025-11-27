import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

    const items = await Promise.all(
        $('.list2 > li')
            .toArray()
            .map(async (item) => {
                item = $(item);
                const newsTitle = item.find('.news_title > a');
                const newsMeta = item.find('.news_meta');

                // article meta
                const link = newsTitle.attr('href');
                const title = newsTitle.text();
                const pubDate = parseDate(newsMeta.text(), 'YYYY-MM-DD', 'zh-cn');

                // fetch article content and return item using cache.tryGet
                // url as cache key
                const url = `${baseUrl}${link}`;
                return await cache.tryGet(url, async () => {
                    // fetch article content
                    // some contents are only available for internal network
                    let description = '';
                    try {
                        const { data: response } = await got(url);
                        const $ = load(response);
                        description = $('.wp_articlecontent').first().html() ?? '';
                    } catch {
                        description = '';
                    }

                    return {
                        title,
                        link,
                        pubDate,
                        description,
                    };
                });
            })
    );

    return {
        title: '东华大学教务处-' + $('.col_title').text(),
        link,
        item: items,
    };
}
