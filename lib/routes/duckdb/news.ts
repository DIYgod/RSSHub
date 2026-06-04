import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/duckdb/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['mocusez'],
    handler,
};

async function handler() {
    const baseUrl = 'https://duckdb.org/news/';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('.postpreview')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text().trim(),
                link: `https://duckdb.org${item.find('a.blocklink').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.date').text(), 'YYYY-MM-DD'), 0),
                author: item.find('.author').text().trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);
                item.description = $('.contentwidth').find('h1, .infoline').remove().end().html();
                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    return {
        // 在此处输出您的 RSS
        title: 'DuckDB News',
        link: baseUrl,
        item: items,
    };
}
