import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?',
    categories: ['study'],
    example: '/bjwxdxh/114',
    parameters: { type: '类型，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新资讯',
    maintainers: ['Misaka13514'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'http://www.bjwxdxh.org.cn';
    const type = ctx.req.param('type');
    const link = type ? `${baseUrl}/news/class/?${type}.html` : `${baseUrl}/news/class/`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);
    const list = $('div#newsquery > ul > li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('div.title > a').text(),
                link: new URL(item.find('div.title > a').attr('href'), baseUrl).href,
                // pubDate: parseDate(item.find('div.time').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(response.data);
                const info = content('div.info')
                    .text()
                    .match(/作者：(.*?)\s+发布于：(.*?\s+.*?)\s/);
                item.author = info[1];
                item.pubDate = timezone(parseDate(info[2], 'YYYY-MM-DD HH:mm:ss'), +8);
                item.description = content('div#con').html().trim().replaceAll('\n', '');
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
