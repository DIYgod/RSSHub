import { Route } from '@/types';
import got from '@/utils/got';
import { generateRequestHeaders, generateProductItem } from './utils';

export const route: Route = {
    path: '/cn/low_price',
    categories: ['shopping'],
    example: '/ikea/cn/low_price',
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
            source: ['ikea.cn/cn/zh/campaigns/wo3-men2-de-chao1-zhi2-di1-jia4-pub8b08af40', 'ikea.cn/'],
        },
    ],
    name: '中国 - 低价优选',
    maintainers: ['jzhangdev'],
    handler,
    url: 'ikea.cn/cn/zh/campaigns/wo3-men2-de-chao1-zhi2-di1-jia4-pub8b08af40',
};

async function handler() {
    const response = await got({
        url: 'https://srv.app.ikea.cn/content/recommendation/v2/product-group/products',
        headers: generateRequestHeaders(),
        searchParams: {
            processOutOfStock: 'SORT',
            groupId: 'cms_低价好物_cms-商品列表-_0',
            page: 1,
            size: 200,
        },
    });

    return {
        title: 'IKEA 宜家 - 低价优选',
        link: 'https://www.ikea.cn/cn/zh/campaigns/wo3-men2-de-chao1-zhi2-di1-jia4-pub8b08af40',
        description: '低价优选',
        item: response.data.products.map((element) => generateProductItem(element)),
    };
}
