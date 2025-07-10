import { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/fd/:type',
    categories: ['traditional-media'],
    example: '/bjx/fd/yw',
    parameters: { type: '文章分类，详见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '风电',
    maintainers: ['hualiong'],
    description: `\`:type\` 类型可选如下

| 要闻 | 政策 | 数据 | 市场 | 企业 | 招标 | 技术 | 报道 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| yw   | zc   | sj   | sc   | mq   | zb   | js   | bd   |`,
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const response = await ofetch(`https://fd.bjx.com.cn/${type}/`);

        const $ = load(response);
        const typeName = $('div.box2 em:last-child').text();
        const list = $('div.cc-list-content ul li:nth-child(-n+20)')
            .toArray()
            .map((item): DataItem => {
                const each = $(item);
                return {
                    title: each.find('a').attr('title')!,
                    link: each.find('a').attr('href'),
                    pubDate: parseDate(each.find('span').text()),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    item.description = $('#article_cont').html()!;
                    return item;
                })
            )
        );

        return {
            title: `北极星风力发电网${typeName}`,
            description: $('meta[name="Description"]').attr('content'),
            link: `https://fd.bjx.com.cn/${type}/`,
            item: items as DataItem[],
        };
    },
};
