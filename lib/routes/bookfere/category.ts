import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category',
    categories: ['reading'],
    example: '/bookfere/skills',
    parameters: { category: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['OdinZhang'],
    handler,
    description: `| 每周一书 | 使用技巧 | 图书推荐 | 新闻速递 | 精选短文 |
  | -------- | -------- | -------- | -------- | -------- |
  | weekly   | skills   | books    | news     | essay    |`,
};

async function handler(ctx) {
    const url = 'https://bookfere.com/category/' + ctx.req.param('category');
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('main div div section');

    return {
        title: $('head title').text(),
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = item.find('time').attr('datetime');
                    const pubDate = parseDate(date);
                    return {
                        title: item.find('h2 a').text(),
                        link: item.find('h2 a').attr('href'),
                        pubDate,
                        description: item.find('p').text(),
                    };
                })
                .get(),
    };
}
