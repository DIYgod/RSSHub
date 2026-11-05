import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { selectItems } from '../utils';

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
| -------- | -------- | -------------------------- | -------- |
| student  | teacher  | class                      | fxzy     |`,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') || 'student';
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Invalid notification type. Use student, teacher, class, or fxzy.');
    }
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);

    const list = $('.list2 > li')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const newsTitle = $item.find('.news_title > a');
            return {
                title: newsTitle.text(),
                link: new URL(newsTitle.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD', 'zh-cn'), 8),
            };
        });

    const items = await pMap(
        selectItems(list),
        (item) =>
            cache.tryGet(item.link, async () => {
                // Some article bodies are restricted to the university network.
                let description: string;
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    description = $('.wp_articlecontent').html() ?? '';
                } catch {
                    description = '';
                }
                return { ...item, description };
            }),
        { concurrency: 3 }
    );

    return {
        title: '东华大学教务处-' + $('.col_title').text(),
        link,
        item: items,
    };
}
