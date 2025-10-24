import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

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

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = load(item);
            const title = $('a').attr('title');
            const link = `https://jiaowc.lsnu.edu.cn/${$('a').attr('href')}`;
            const date = $('td[width="80"]').text();

            const single = await cache.tryGet(link, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const articleData = response.data;
                const article$ = load(articleData);
                const description = article$('.v_news_content').html();

                return {
                    title,
                    link,
                    description,
                    pubDate: new Date(date).toUTCString(),
                };
            });

            return single;
        })
    );

    return {
        title: '乐山师范学院教学部通知公告',
        link: 'https://jiaowc.lsnu.edu.cn/tzgg.htm',
        item: out,
    };
}
