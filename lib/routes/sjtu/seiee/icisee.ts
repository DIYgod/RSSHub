import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

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
            item = $(item);

            return {
                title: item.find('.tit').text().trim(),
                link: item.find('a').attr('href'),
                pubDate: timezone(parseDate(item.find('.time').text().trim())),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch.raw(item.link);
                if (new URL(detailResponse.url).hostname !== 'mp.weixin.qq.com') {
                    return { ...item, description: $(detailResponse._data).find('.xwxq').html() };
                }
                item.link = detailResponse.url;
                return await finishArticleItem(item);
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
