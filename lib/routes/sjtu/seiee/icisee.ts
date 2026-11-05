import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/seiee/icisee/:cat',
    categories: ['university'],
    example: '/sjtu/seiee/icisee/news',
    parameters: { cat: '子类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: '集成电路学院（信息与电子工程学院）',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const cat = ctx.req.param('cat');

    const rootUrl = 'https://icisee.sjtu.edu.cn/';
    const currentUrl = `${rootUrl}/${cat}.html`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.djdt li')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const published = $item.find('.time').text().trim();
            return {
                title: $item.find('.tit').text(),
                link: $item.find('a').attr('href'),
                pubDate: published ? parseDate(`${published} +0000`, 'MM/DD/YYYY ZZ') : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author' | 'link'>>(`sjtu:icisee:details:v4:${item.link}`, async () => {
                const detailResponse = await ofetch.raw(item.link!);
                if (new URL(detailResponse.url).hostname !== 'mp.weixin.qq.com') {
                    return { description: $(detailResponse._data).find('.xwxq').html() };
                }
                const article = await fetchArticle(detailResponse.url);
                return { link: detailResponse.url, description: article.description, author: article.author, pubDate: article.pubDate };
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
