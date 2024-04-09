import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseArticle } from './utils';

export const route: Route = {
    path: '/sports/:type?',
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    let currentUrl = `https://sports.sina.com.cn/others/${type}.shtml`;
    let query = 'ul.list2 li a';

    if (type === 'ufc') {
        currentUrl = 'http://roll.sports.sina.com.cn/s_ufc_all/index.shtml';
        query = '#d_list ul li span a';
    } else if (type === 'winter' || type === 'horse') {
        currentUrl = `https://sports.sina.com.cn/${type}/`;
        query = '[class^=news-list] .list li a';
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $(query)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href').replace('http://', 'https://'),
            };
        });

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `${$('title').text().split('_')[0]} - 新浪体育`,
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        item: items,
    };
}
