import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
// import { parseRelativeDate } from '@/utils/parse-date';
import { baseUrl, parseTradeItem } from './utils';

export const route: Route = {
    path: '/trading/:id',
    categories: ['new-media'],
    example: '/dcfever/trading/1',
    parameters: { id: '分類 ID，見下表' },
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

    const link = new URL(`${baseUrl}/trading/listing.php`, baseUrl);
    link.searchParams.append('id', id);
    link.searchParams.append('order', order);
    link.searchParams.append('type', 'all');
    const response = await ofetch(link.href);
    const $ = load(response);

    const list = $('.item_grid_wrap div a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.lazyloadx').attr('alt'),
                link: new URL(item.attr('href'), link.href).href,
                author: item.find('.trade_info div span').eq(1).text(),
            };
        });

    const items = await Promise.all(list.map((item) => parseTradeItem(item)));

    return {
        title: $('head title').text(),
        link: link.href,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
}
