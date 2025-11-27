import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

// import { parseRelativeDate } from '@/utils/parse-date';
import { baseUrl, parseTradeItem } from './utils';

export const route: Route = {
    path: '/trading/search/:keyword/:mainCat?',
    categories: ['new-media'],
    example: '/dcfever/trading/search/Sony',
    parameters: { keyword: '關鍵字', mainCat: '主要分類 ID，見上表' },
    name: '二手市集 - 物品搜尋',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { keyword, mainCat } = ctx.req.param();

    const link = new URL(`${baseUrl}/trading/search.php`, baseUrl);
    link.searchParams.append('keyword', keyword);
    link.searchParams.append('type', 'all');
    mainCat && link.searchParams.append('main_cat', mainCat);
    link.searchParams.append('form_action', 'search_action');
    const response = await ofetch(link.href);
    const $ = load(response);

    const list = $('.item_list li a')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.optional').remove();
            return {
                title: item.find('.trade_title').text(),
                link: new URL(item.attr('href'), link.href).href,
                author: item.find('.trade_info').text(),
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
