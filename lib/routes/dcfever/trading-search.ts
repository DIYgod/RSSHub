import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
// import { parseRelativeDate } from '@/utils/parse-date';
import { baseUrl, parseTradeItem } from './utils';

export const route: Route = {
    path: '/trading/search/:keyword/:mainCat?',
    categories: ['new-media'],
    example: '/dcfever/trading/search/Sony',
    parameters: { keyword: '關鍵字', mainCat: '主要分類 ID，見上表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '二手市集 - 物品搜尋',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { keyword, mainCat } = ctx.req.param();

    const response = await got(`${baseUrl}/trading/search.php`, {
        searchParams: {
            keyword,
            type: 'all',
            main_cat: mainCat,
            form_action: 'search_action',
        },
    });
    const $ = load(response.data);

    const list = $('.item_list li a')
        .toArray()
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
