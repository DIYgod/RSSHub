import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/chinatax/latest',
    categories: ['government'],
    example: '/gov/chinatax/latest',
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
            source: ['www.chinatax.gov.cn/*'],
        },
    ],
    name: '最新文件',
    maintainers: ['nczitzk', 'fuzy112'],
    handler,
    url: 'www.chinatax.gov.cn/*',
};

async function handler() {
    const link = `http://www.chinatax.gov.cn/chinatax/n810341/n810755/index.html`;

    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    const list = $('ul.list.whlist li')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), `http://www.chinatax.gov.cn`).toString(),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const res = await got({ method: 'get', url: item.link });
                    const content = load(res.data);
                    item.pubDate = content('meta[name="PubDate"]').attr('content');
                    item.description = content('#fontzoom').html();
                    return item;
                } catch (error) {
                    if (error.name === 'HTTPError' || error.name === 'FetchError') {
                        item.description = error.message;
                        return item;
                    }
                    throw error;
                }
            })
        )
    );

    return {
        title: '国家税务总局 - 最新文件',
        link,
        item: items,
    };
}
