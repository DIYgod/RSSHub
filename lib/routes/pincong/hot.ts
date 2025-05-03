import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, puppeteerGet } from './utils';

export const route: Route = {
    path: '/hot/:category?',
    categories: ['bbs'],
    example: '/pincong/hot',
    parameters: { category: '分类，与官网分类 URL `category-` 后的数字对应，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精选',
    maintainers: ['zphw'],
    handler,
};

async function handler(ctx) {
    const { category = '0' } = ctx.req.param();

    const url = `${baseUrl}/hot/list/category-${category}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: '品葱 - 精选',
        link: `${baseUrl}/hot/${category === '0' ? '' : `category-${category}`}`,
        item: list.toArray().map((item) => ({
            title: $(item).find('h2 a').text().trim(),
            description: $(item).find('div.markitup-box').html(),
            link: baseUrl + $(item).find('div.mod-head h2 a').attr('href'),
            pubDate: parseDate($(item).find('div.mod-footer .aw-small-text').text()),
        })),
    };
}
