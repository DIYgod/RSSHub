import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/rank',
    categories: ['shopping'],
    example: '/guangdiu/rank',
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
            source: ['guangdiu.com/rank'],
        },
    ],
    name: '一小时风云榜',
    maintainers: ['fatpandac'],
    handler,
    url: 'guangdiu.com/rank',
};

async function handler() {
    const url = `${host}/rank.php`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.hourrankitem')
        .toArray()
        .map((item) => ({
            title: $(item).find('a.hourranktitle').text(),
            link: new URL($(item).find('a.hourranktitle').attr('href'), host).href,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('div.hourranktime').text());

                return item;
            })
        )
    );

    return {
        title: `逛丢 - 一小时风云榜`,
        link: url,
        item: items,
    };
}
