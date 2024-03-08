import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hr/:category?/:type?',
    categories: ['forecast'],
    example: '/uibe/hr',
    parameters: { category: '分类，可在对应页 URL 中找到，默认为通知公告', type: '类型，可在对应页 URL 中找到，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['hr.uibe.edu.cn/:category/:type', 'hr.uibe.edu.cn/:category', 'hr.uibe.edu.cn/'],
    },
    name: '人力资源处',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'tzgg';
    const type = ctx.req.param('type') ?? '';

    const rootUrl = 'http://hr.uibe.edu.cn';
    const currentUrl = `${rootUrl}/${category}${type ? `/${type}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.lawul, .longul')
        .find('li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('p').text(),
                link: `${currentUrl}/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('.gp-article').html();
                    item.pubDate = parseDate(content('#shareTitle').next().text().replace('时间：', ''));
                } catch {
                    item.description = 'Not Found';
                }

                return item;
            })
        )
    );

    return {
        title: `${$('.picTit').text()} - 对外经济贸易大学人力资源处`,
        link: currentUrl,
        item: items,
    };
}
