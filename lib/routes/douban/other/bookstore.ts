import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/bookstore',
    categories: ['social-media'],
    example: '/douban/bookstore',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '豆瓣书店',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const link = 'https://market.douban.com/book/';
    const response = await got({
        method: 'get',
        url: 'https://market.douban.com/api/freyr/books?page=1&page_size=20&type=book',
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;

    return {
        title: '豆瓣书店',
        link,
        description: '在豆瓣书店，遇见美好·書生活',
        item: data.map(({ title, url, price, square_pic, rectangle_pic, desc }) => ({
            title,
            link: url,
            description: `
        <img src="${rectangle_pic}"><br>
        <img src="${square_pic}"><br>
        ${desc}<br>
        <strong>价格:</strong> ${price}元
      `,
        })),
    };
}
