import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/search/:query?',
    categories: ['shopping'],
    example: '/guangdiu/search/q=百度网盘',
    parameters: { query: '链接参数，对应网址问号后的内容' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键字搜索',
    maintainers: ['Huzhixin00'],
    handler,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const url = `${host}/${query ? `search.php?${query}` : ''}`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .toArray()
        .map((item) => ({
            title: $(item).find('a.goodname').text().trim(),
            link: `${host}/${$(item).find('a.goodname').attr('href')}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('span.latesttime').text());

                return item;
            })
        )
    );

    const match = /q=(.+)/.exec(query);

    return {
        title: `逛丢 - ${match[1]}`,
        link: url,
        item: items,
    };
}
