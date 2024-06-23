import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:categoryId?',
    categories: ['other'],
    example: '/ptyqm',
    parameters: { categoryId: '项目分类，见下表，默认为 `kfyqzc`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['lxzy'],
    radar: [
        {
            source: ['www.ptyqm.com/category/:categoryId'],
            target: '/:categoryId',
        },
    ],
    handler,
    description: `| 开放注册 | 玩转pt | pt站大全 |
  | -------- | -------- | -------- |
  | kfyqzc   | wzpt     | ptzddq   |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.ptyqm.com/category';
    const categoryId = ctx.req.param('categoryId') || 'kfyqzc';
    const url = `${baseUrl}/${categoryId}/`;

    const { data: response } = await got(url);
    const $ = load(response);

    const items = $('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h2').find('a');
            return {
                title: title.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: title.attr('href'),
                pubDate: parseDate(item.find('time').attr('datetime')),
                author: item.find('.post-tag a').first().text(),
                description: item.find('.archive-content').text(),
            };
        });
        return {
            // 源标题
            title: `PT邀请码`,
            // 源链接
            link: url,
            // 源文章
            item: items,
        };
}
