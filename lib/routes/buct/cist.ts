import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/cist',
    categories: ['university'],
    example: '/buct/cist',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['cist.buct.edu.cn/xygg/list.htm', 'cist.buct.edu.cn/xygg/main.htm'], target: '/cist' }],
    name: '信息学院',
    maintainers: ['Epic-Creeper'],
    handler,
    url: 'buct.edu.cn/',
};

async function handler() {
    const rootUrl = 'https://cist.buct.edu.cn';
    const currentUrl = `${rootUrl}/xygg/list.htm`;

    const response = await got.get(currentUrl);
    const $ = load(response.data);
    const list = $('ul.wp_article_list > li.list_item')
        .toArray()
        .map((item) => ({
            pubDate: $(item).find('.Article_PublishDate').text(),
            title: $(item).find('a').attr('title'),
            link: `${rootUrl}${$(item).find('a').attr('href')}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);

                item.description = content('.wp_articlecontent').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
