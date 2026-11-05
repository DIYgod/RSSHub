import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/jiaowc/tzgg/:category?',
    categories: ['university'],
    example: '/lsnu/jiaowc/tzgg',
    parameters: { category: '分类名' },
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
            source: ['lsnu.edu.cn/'],
            target: '/jiaowc/tzgg',
        },
    ],
    name: '教学部通知公告',
    maintainers: ['nyaShine'],
    handler,
    url: 'lsnu.edu.cn/',
    description: `| 实践教学科 | 教育运行科 | 教研教改科 | 学籍管理科 | 考试科 | 教材建设管理科 |
| ---------- | ---------- | ---------- | ---------- | ------ | -------------- |
| sjjxk      | jxyxk      | jyjgk      | xjglk      | ksk    | jcjsglk        |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = category ? `https://jiaowc.lsnu.edu.cn/tzgg/${category}.htm` : 'https://jiaowc.lsnu.edu.cn/tzgg.htm';

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('tr[id^="line_u5_"]').toArray();

    const out = await pMap(
        list,
        async (item) => {
            const $item = $(item);
            const title = $item.find('a').attr('title');
            const link = new URL($item.find('a').attr('href')!, url).href;
            const date = $item.find('td[width="80"]').text().trim();

            const description = await cache.tryGet('lsnu:article:' + link, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const articleData = response.data;
                const article$ = load(articleData);
                return article$('.v_news_content').html();
            });

            return {
                title: title!,
                link,
                description,
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '乐山师范学院教学部通知公告',
        link: 'https://jiaowc.lsnu.edu.cn/tzgg.htm',
        item: out,
    };
}
