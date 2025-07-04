import { Route } from '@/types';
import { getOriginUrl, getArticleDesc } from './utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tab/:tab?',
    categories: ['picture'],
    example: '/jpxgmn/tab',
    parameters: { tab: '分类，默认为`top`，包括`top`、`new`、`hot`，以及[源网站](http://www.jpxgmn.com/)所包含的其他相对路径，比如`Xiuren`、`XiaoYu`等' },
    radar: [
        {
            source: ['mei5.vip/:tab'],
            target: '/:tab',
        },
    ],
    name: '分类',
    maintainers: ['Urabartin'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const { tab = 'top' } = ctx.req.param();
    const isSpecial = ['new', 'top', 'hot'].includes(tab);
    const tabUrl = `${await getOriginUrl()}/${tab}` + (isSpecial ? '.html' : '/');
    const response = await ofetch.raw(tabUrl);
    const baseUrl = new URL(response.url).origin;
    const $ = load(response._data);
    const topTitle = $('div.toptip > a').get(1);
    let feedTitle = $('title').text();
    if (isSpecial) {
        feedTitle = feedTitle.split('_')[1];
    } else if (topTitle) {
        feedTitle = $(topTitle).text();
    }
    const items = $('div.related_posts ul > li')
        .toArray()
        .map((item) => ({
            title: $(item).find('a span').text(),
            link: new URL($(item).find('a').attr('href'), baseUrl).href,
            pubDate: parseDate($(item).find('footer span').first().text()),
        }));
    return {
        title: `极品性感美女 - ${feedTitle}`,
        link: response.url,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    item.description = await getArticleDesc(item.link);
                    return item;
                })
            )
        ),
    };
}
