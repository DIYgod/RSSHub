import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const categories = {
    nba: 'NBA',
    zuqiu: '足球',
    dianjing: '电竞',
    other: '综合',
};
export const route: Route = {
    path: '/more/:category?',
    categories: ['bbs'],
    example: '/zhibo8/more/nba',
    parameters: { category: '分类，见下表，默认为 NBA' },
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
            source: ['news.zhibo8.cc/:category'],
            target: '/more/:category',
        },
    ],
    name: '滚动新闻',
    description: `| NBA | 足球  | 电竞     | 综合   |
| --- | ----- | -------- | ------ |
| nba | zuqiu | dianjing | zonghe |`,
    maintainers: ['nczitzk'],
    handler,
};
async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'nba';
    const limit = getRouteLimit(ctx, 100);
    const rootUrl = 'https://news.zhibo8.cc';
    let list: Array<
        DataItem & {
            link: string;
        }
    >;
    let currentUrl: string;
    let response;
    if (category === 'nba' || category === 'zuqiu') {
        currentUrl = `${rootUrl}/${category}/more.htm`;
        response = await got(currentUrl);
        const $ = load(response.data);
        list = $('ul.articleList li')
            .slice(0, limit)
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                return {
                    title: a.text(),
                    link: `https:${a.attr('href')}`,
                    pubDate: parseDate($item.find('span.postTime').text(), 8),
                    category: $item.attr('data-label')!.split(',').filter(Boolean),
                };
            });
    } else {
        currentUrl = `${rootUrl}/${category}`;
        const apiUrl = `https://api.qiumibao.com/application/app/index.php?_url=/news/${category}List`;
        response = await got(apiUrl);
        list = response.data.data.list.map((item) => ({
            title: item.title,
            link: `https:${item.url}`,
            pubDate: parseDate(item.createtime, 8),
        }));
    }
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`${item.link}:description`, async () => {
                const res = await got(item.link);
                const content = load(res.data);
                return { description: content('div.content').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );
    return {
        title: `${categories[category]} - 直播吧`,
        link: currentUrl,
        item: items,
    };
}
