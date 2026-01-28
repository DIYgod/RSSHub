import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderArticle } from './templates/article';

export const route: Route = {
    path: '/database',
    categories: ['traditional-media'],
    example: '/caixin/database',
    parameters: {},
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
            source: ['k.caixin.com/web', 'k.caixin.com/'],
        },
    ],
    name: '财新数据通',
    maintainers: ['nczitzk'],
    handler,
    url: 'k.caixin.com/web',
};

async function handler() {
    const rootUrl = 'https://database.caixin.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('h4 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href').replace('http://', 'https://'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);
                item.description = renderArticle({
                    item,
                    $: content,
                });
                item.author = content('.top-author').text();

                return item;
            })
        )
    );

    return {
        title: '财新数据通 - 专享资讯',
        link: currentUrl,
        item: items,
    };
}
