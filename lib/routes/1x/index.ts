import got from '@/utils/got';
import { load } from 'cheerio';

const categories = {
    latest: 'latest',
    popular: 'popular',
    published: 'published',
    abstract: 'latest:15:',
    action: 'latest:1:',
    animals: 'latest:21:',
    architecture: 'latest:11:',
    conceptual: 'latest:17:',
    'creative-edit': 'latest:10:',
    documentary: 'latest:8:',
    everyday: 'latest:14:',
    'fine-art-nude': 'latest:12:',
    humour: 'latest:3:',
    landscape: 'latest:6:',
    macro: 'latest:2:',
    mood: 'latest:4:',
    night: 'latest:9:',
    performance: 'latest:19:',
    portrait: 'latest:13:',
    'still-life': 'latest:18:',
    street: 'latest:7:',
    underwater: 'latest:20:',
    wildlife: 'latest:5:',
};

export const route: Route = {
    path: '/index/:category?',
    categories: ['picture'],
    example: '/1x/index/latest',
    parameters: { category: '图片类别，见下表，默认为latest。' },
    radar: [
        {
            source: ['1x.com'],
        },
    ],
    name: 'Awarded',
    maintainers: ['ladeng07'],
    handler,
    url: '1x.com/gallery/latest/awarded',
    description: `

| 最新   | 热门    | 已发布    | 抽象       | 动作      | 动物       |
| ------ | ------- | --------- | ---------- | --------- | ---------- |
| latest | popular | published | latest:15: | latest:1: | latest:21: |

| 建筑       | 概念       | 创意编辑   | 纪录片    | 日常       |
| ---------- | ---------- | ---------- | --------- | ---------- |
| latest:11: | latest:17: | latest:10: | latest:8: | latest:14: |

| 裸体艺术   | 幽默      | 风景      | 微距      | 情绪      |
| ---------- | --------- | --------- | --------- | --------- |
| latest:12: | latest:3: | latest:6: | latest:2: | latest:4: |

| 夜景      | 表演       | 人像       | 静物       | 街道      | 水下       | 野生动物  |
| --------- | ---------- | ---------- | ---------- | --------- | ---------- | --------- |
| latest:9: | latest:19: | latest:13: | latest:18: | latest:7: | latest:20: | latest:5: |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'latest';

    const rootUrl = `https://1x.com`;
    const currentUrl = `${rootUrl}/gallery/${category}`;
    const apiUrl = `${rootUrl}/backend/lm.php?style=normal&mode=${categories[category]}&from=0&autoload=`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const $ = load(response.data);

    const items = $('root data')
        .html()
        .split('\n')
        .slice(0, -1)
        .map((item) => {
            item = $(item);

            const id = item
                .find('.photos-feed-image')
                .attr('id')
                .match(/img-(\d+)/)[1];

            return {
                guid: id,
                link: `${rootUrl}/photo/${id}`,
                author: item.find('.photos-feed-data-name').eq(0).text(),
                title: item.find('.photos-feed-data-title').text() || 'Untitled',
                description: `<img src="${item.find('.photos-feed-image').attr('src')}">`,
            };
        });

    return {
        title: `${category} - 1X`,
        link: currentUrl,
        item: items,
    };
}
