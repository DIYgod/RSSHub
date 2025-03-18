import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
export const route: Route = {
    path: '/haowen/fenlei/:name/:sort?',
    categories: ['shopping'],
    example: '/smzdm/haowen/fenlei/shenghuodianqi',
    parameters: { name: '分类名，可在 URL 中查看', sort: '排序方式，默认为最新' },
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
            source: ['post.smzdm.com/fenlei/:name'],
            target: '/haowen/fenlei/:name',
        },
    ],
    name: '好文分类',
    maintainers: ['LogicJake'],
    handler,
    description: `| 最新 | 周排行 | 月排行 |
| ---- | ------ | ------ |
| 0    | 7      | 30     |`,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const sort = ctx.req.param('sort') || '0';

    const link = sort === '0' ? `https://post.smzdm.com/fenlei/${name}/` : `https://post.smzdm.com/fenlei/${name}/hot_${sort}/`;

    const response = await got.get(link);
    const $ = load(response.data);
    const title = $('div.crumbs.nav-crumbs').text().split('>').pop();

    const list = $('div.list.post-list')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2.item-name a').text(),
                link: item.find('h2.item-name a').attr('href'),
                description: item.find('.item-info').html(),
                author: item.find('.nickname').text(),
                pubDate: timezone(parseDate(item.find('span.time').text(), ['HH:mm', 'MM-DD HH:mm', 'YYYY-MM-DD HH:mm']), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    item.description = $('article').html();
                    item.pubDate = timezone(parseDate($('meta[property="og:release_date"]').attr('content')), 8);
                    item.author = $('meta[property="og:author"]').attr('content');
                } catch {
                    // 404
                }

                return item;
            })
        )
    );

    return {
        title: `${title}- 什么值得买好文分类`,
        link,
        item: out,
    };
}
