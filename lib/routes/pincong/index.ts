import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, puppeteerGet } from './utils';

export const route: Route = {
    path: '/category/:category?/:sort?',
    categories: ['bbs'],
    example: '/pincong/category/1/new',
    parameters: { category: '分类，与官网分类 URL `category-` 后的数字对应，默认为全部', sort: '排序方式，参数可见下表，默认为推荐' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '发现',
    maintainers: ['zphw'],
    handler,
    description: `| 最新 | 推荐      | 热门 |
| ---- | --------- | ---- |
| new  | recommend | hot  |`,
};

async function handler(ctx) {
    let url = `${baseUrl}/`;

    const sortMap = {
        new: 'sort_type-new',
        recommend: 'recommend-1',
        hot: 'sort_type-hot__day2',
    };

    url += (ctx.req.param('sort') && sortMap[ctx.req.param('sort')]) || 'recommend-1';
    url += ctx.req.param('category') ? '__category-' + ctx.req.param('category') : '';

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: '品葱 - 发现',
        link: url,
        item: list
            .map((_, item) => ({
                title: $(item).find('h4 a').text().trim(),
                link: baseUrl + $(item).find('h4 a').attr('href'),
                pubDate: parseDate($(item).attr('data-created-at') * 1000),
            }))
            .get(),
    };
}
