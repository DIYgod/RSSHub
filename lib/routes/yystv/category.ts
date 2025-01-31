import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['game'],
    example: '/yystv/category/recommend',
    parameters: { category: '专栏类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游研社 - 分类文章',
    maintainers: ['LightStrawberry'],
    handler,
    description: `| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
| --------- | ------- | ------ | ------- | ---- | -------- |
| recommend | history | big    | culture | news | retro    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://www.yystv.cn/b/${category}`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);

    const first_part = $('.b-list-main-item')
        .slice(0, 2)
        .map(function () {
            const info = {
                title: $(this).find('.b-main-info-title').text(),
                link: 'https://www.yystv.cn' + $(this).find('.b-main-info-title a').attr('href'),
                pubDate: parseRelativeDate($(this).find('.b-main-createtime').text()),
                author: $(this).find('.b-author').text(),
            };
            return info;
        })
        .get();

    const second_part = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'https://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: $('.c-999', this).text().includes('-') ? parseDate($('.c-999', this).text()) : parseRelativeDate($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
            };
            return info;
        })
        .get();

    const items = [...first_part, ...second_part];
    function getDescription(items) {
        return Promise.all(
            items.map(async (currentValue) => {
                currentValue.description = await cache.tryGet(currentValue.link, async () => {
                    const r = await got({
                        url: currentValue.link,
                        method: 'get',
                    });
                    const $ = load(r.data);
                    return $('.doc-content.rel').html();
                });
                return currentValue;
            })
        );
    }
    await getDescription(items).then(() => ({
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/b/${category}`,
        item: items,
    }));
}
