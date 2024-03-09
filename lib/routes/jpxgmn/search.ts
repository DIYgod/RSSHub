import { Route } from '@/types';
import { originUrl, getArticleDesc } from './utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:kw',
    categories: ['picture'],
    example: '/jpxgmn/search/candy',
    parameters: { kw: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索',
    maintainers: ['Urabartin'],
    handler,
};

async function handler(ctx) {
    const { kw } = ctx.req.param();
    const searchUrl = originUrl + `/plus/search/index.asp?keyword=${kw}`;
    const response = await got(searchUrl);
    const baseUrl = new URL(response.url).origin;
    const $ = load(response.data);
    const items = $('div.list div.list div.node p')
        .toArray()
        .map((item) => ({
            title: $(item).find('b').text(),
            link: new URL($(item).find('a').attr('href'), baseUrl).href,
        }))
        .filter((item) => item.title.length !== 0);
    for (const [index, info] of $('div.list div.node div.info').toArray().entries()) {
        items.at(index).pubDate = parseDate($(info).find('span').first().text());
    }
    return {
        title: `极品性感美女搜索 - ${kw}`,
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
