import { Route } from '@/types';
import { getTeslaPrice } from './get-price';

export const route: Route = {
    path: '/price',
    categories: ['shopping'],
    example: '/tesla/price',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tesla.cn/model3/design', 'tesla.cn/'],
        },
    ],
    name: '价格',
    maintainers: ['xiaokyo'],
    handler,
    url: 'tesla.cn/model3/design',
};

async function handler() {
    const cars = [
        {
            name: 'Model 3',
            slug: 'model3',
            link: 'https://www.dongchedi.com/auto/series/3762',
        },
        {
            name: 'Model Y',
            slug: 'modely',
            link: 'https://www.dongchedi.com/auto/series/4363',
        },
        {
            name: 'Model S',
            slug: 'models',
            link: 'https://www.dongchedi.com/auto/series/1254',
        },
        {
            name: 'Model X',
            slug: 'modelx',
            link: 'https://www.dongchedi.com/auto/series/1255',
        },
    ];

    const promises = cars.map((car) => getTeslaPrice(car.link));
    const prices = await Promise.all(promises);

    return {
        title: 'Tesla Model 系列价格更新',
        link: 'https://www.tesla.cn/model3/design#overview',
        description: 'Tesla Model 系列价格更新',
        item: prices.map((price, index) => ({
            title: `${cars[index].name} 价格更新为 ${price}`,
            link: `https://www.tesla.cn/${cars[index].slug}/design#overview`,
            author: 'Tesla',
            guid: `https://www.tesla.cn/${cars[index].slug}/design#overview#${price}`,
        })),
    };
}
