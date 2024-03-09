import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
// import { parseRelativeDate } from '@/utils/parse-date';
import { baseUrl, parseTradeItem } from './utils';

export const route: Route = {
    path: '/trading/:id',
    categories: ['new-media'],
    example: '/dcfever/trading/1',
    parameters: { id: '分類 ID，見下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '二手市集',
    maintainers: ['TonyRL'],
    handler,
    description: `[所有物品分類](https://www.dcfever.com/trading/index.php#all_cats)

  | 攝影產品 | 電腦 | 手機通訊 | 影音產品 | 遊戲機、模型 | 電器傢俱 | 潮流服飾 | 手錶 | 單車及運動 | 其它 |
  | -------- | ---- | -------- | -------- | ------------ | -------- | -------- | ---- | ---------- | ---- |
  | 1        | 2    | 3        | 44       | 43           | 104      | 45       | 99   | 109        | 4    |`,
};

async function handler(ctx) {
    const { id, order = 'new' } = ctx.req.param();

    const response = await got(`${baseUrl}/trading/listing.php`, {
        searchParams: {
            id,
            order,
            type: 'all',
        },
    });
    const $ = load(response.data);

    const list = $('.item_list li a')
        .toArray()
        .filter((item) => $(item).attr('href') !== '/documents/advertising.php')
        .map((item) => {
            item = $(item);
            item.find('.optional').remove();
            return {
                title: item.find('.trade_title').text(),
                link: new URL(item.attr('href'), response.url).href,
                author: item.find('.trade_info').text(),
            };
        });

    const items = await Promise.all(list.map((item) => parseTradeItem(item, cache.tryGet)));

    return {
        title: $('head title').text(),
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
}
