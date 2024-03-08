import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article/:category?',
    categories: ['forecast'],
    example: '/hitsz/article/id-74',
    parameters: { category: '分类名，默认为校园动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻中心',
    maintainers: ['xandery-geek'],
    handler,
};

async function handler(ctx) {
    const host = 'https://www.hitsz.edu.cn';
    const category = ctx.req.param('category') ?? 'id-77';
    const link = `${host}/article/${category}.html`;

    const response = await got(link);
    const $ = load(response.data);
    const category_name = $('div.title_page').text().trim();

    const lists = $('.mainside_news ul li')
        .toArray()
        .map((el) => ({
            title: $('a', el).text().trim(),
            link: `${host}${$('a', el).attr('href')}`,
            pubDate: timezone(parseDate($('span[class=date]', el).text()), 8),
        }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);
                item.description = $('div.edittext').html().trim();
                item.pubDate = timezone(parseDate($('.item').first().text().replace('发布时间：', '')), 8);
                return item;
            })
        )
    );

    return {
        title: '哈尔滨工业大学（深圳）-' + category_name,
        link,
        description: '哈尔滨工业大学（深圳）-' + category_name,
        item: items,
    };
}
