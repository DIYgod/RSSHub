import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/newest',
    categories: ['shopping'],
    example: '/coolbuy/newest',
    name: '最新',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const response = await ofetch('https://coolbuy.com/api/v1.4/product_preview/?order_by=-id&limit=20&page=0&offset=0');

    return {
        title: '玩物志-最新',
        link: 'https://coolbuy.com/',
        description: '值得买的未来生活',
        item: response.objects.map((item) => ({
            title: item.title,
            link: item.visit_url,
            description: `<img src="${item.cover_image}"><br><img src="${item.display_image}"><br><br>${item.summary}<br>价格: ${item.price}元`,
        })),
    };
}
