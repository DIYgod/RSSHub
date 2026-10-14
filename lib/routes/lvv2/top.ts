import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderOutlink } from './templates/outlink';

const rootUrl = 'https://lvv2.com';

const titleMap = {
    'sort-realtime': {
        't-month': '24小时榜 一月内',
        't-week': '24小时榜 一周内',
        't-day': '24小时榜 一天内',
        't-hour': '24小时榜 一小时内',
    },
    'sort-hot': '热门',
    'sort-new': '最新',
    'sort-score': {
        't-month': '得分 一月内',
        't-week': '得分 一周内',
        't-day': '得分 一天内',
        't-hour': '得分 一小时内',
    },
};

export const route: Route = {
    path: '/top/:channel/:sort?',
    categories: ['new-media'],
    example: '/lvv2/top/sort-score',
    parameters: { channel: '频道，见下表', sort: '排序方式，仅得分和24小时榜可选填该参数，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '24 小时点击排行 Top 10',
    maintainers: ['Fatpandac'],
    handler,
    description: `|   热门   |   最新   |    得分    |   24 小时榜   |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
| :------: | :------: | :----: | :------: | :------: |
|          |  t-hour  |  t-day |  t-week  |  t-month |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const sort = (channel === 'sort-realtime' || channel === 'sort-score') && !ctx.req.param('sort') ? 't-week' : ctx.req.param('sort');
    const url = `${rootUrl}/${channel}${sort ? `/${sort}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('#top-content-news > div')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('div.md > a').text(),
            link: new URL($(item).find('div.md > a').attr('href')!, rootUrl).href.replace(/(https:\/\/lvv2\.com.*?)\/title.*/, '$1'),
        }));

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`lvv2:detail:${item.link}`, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);

                const pubDate = timezone(parseDate(content('time').attr('datetime')!), 8);
                const author = content('a.author').text();
                const link = content('h2.title > a.title').attr('href');
                const description =
                    new URL(link!, item.link).hostname === 'instant.lvv2.com'
                        ? await cache.tryGet(`lvv2:article:${link}`, async () => {
                              const articleResponse = await got(link);
                              const article = load(articleResponse.data);

                              const description = article('#_tl_editor')
                                  .html()!
                                  .replaceAll(/(<img.*?)data-src(.*?>)/g, '$1src$2');

                              return description;
                          })
                        : renderOutlink(link!);

                return { pubDate, author, description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `lvv2 - ${sort ? titleMap[channel][sort] : titleMap[channel]} 24小时点击 Top 10`,
        link: url,
        item: items,
    };
}
