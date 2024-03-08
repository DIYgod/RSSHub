import { Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchBrandInfo } from './service';

export const route: Route = {
    path: '/brand/:id',
    categories: ['game'],
    example: '/showstart/brand/34707',
    parameters: { id: '厂牌 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.showstart.com/host/:id'],
    },
    name: '厂牌 - 演出更新',
    maintainers: ['lchtao26'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const brand = await fetchBrandInfo({
        brandId: id,
    });
    return {
        title: `${TITLE} - ${brand.name}`,
        description: brand.content,
        link: `${HOST}/host/${brand.id}`,
        item: brand.activityList,
    };
}
