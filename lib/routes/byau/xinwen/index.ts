import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:type_id',
    categories: ['university'],
    example: '/byau/news/3674',
    parameters: { type_id: '栏目类型(从菜单栏获取对应 ID)' },
    radar: [
        {
            source: ['xinwen.byau.edu.cn/:type_id/list.htm'],
            target: '/news/:type_id',
        },
    ],
    name: '新闻网',
    maintainers: ['ueiu'],
    handler,
    url: 'xinwen.byau.edu.cn',
    description: `| 学校要闻 | 校园动态 |
| ---- | ----------- |
| 3674 | 3676 |`,
};

async function handler(ctx) {
    const baseUrl = 'http://xinwen.byau.edu.cn/';

    const typeID = ctx.req.param('type_id');
    const url = `${baseUrl}${typeID}/list.htm`;

    const response = await got(url);
    const $ = load(response.data);

    const list = $('.news')
        .toArray()
        .map((item) => {
            const $$ = load(item);

            const originalItemUrl = $$('a').attr('href');
            // 因为学校要闻的头两个像是固定了跳转专栏页面的，不能相同处理
            const startsWithHttp = originalItemUrl.startsWith('http');
            const itemUrl = startsWithHttp ? originalItemUrl : new URL(originalItemUrl, baseUrl).href;

            return {
                title: $$('a').text(),
                link: itemUrl,
                pubDate: timezone(parseDate($$('.news_meta').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.col_news_con').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
