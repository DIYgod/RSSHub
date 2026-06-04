import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/bookstore/newest',
    categories: ['social-media'],
    example: '/zhihu/bookstore/newest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '知乎书店 - 新书',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://api.zhihu.com/books/features/new',
    });

    const data = response.data.data;

    return {
        title: '知乎书店-新书抢鲜',
        link: 'https://www.zhihu.com/pub/features/new',
        item: data.map((item) => {
            const authors = item.authors.map((author) => author.name).join('、');

            return {
                title: item.title,
                link: item.url,
                description: `
          <img src="${item.cover.replaceAll(/_.+\.jpg/g, '.jpg')}"><br>
          <strong>${item.title}</strong><br>
          作者: ${authors}<br><br>
          ${item.description}<br><br>
          价格: ${item.promotion.price / 100}元
        `,
            };
        }),
    };
}
