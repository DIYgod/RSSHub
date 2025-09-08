import { Data, Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchBrandInfo } from './service';
import type { Context } from 'hono';

export const route: Route = {
    path: '/brand/:id',
    categories: ['shopping'],
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
    radar: [
        {
            source: ['www.showstart.com/host/:id'],
        },
    ],
    name: '按厂牌 - 演出更新',
    maintainers: ['lchtao26'],
    handler,
    description: `::: tip
厂牌 ID 查询: \`/showstart/search/brand/:keyword\`，如: [https://rsshub.app/showstart/search/brand/声场](https://rsshub.app/showstart/search/brand/声场)
:::`,
};

async function handler(ctx: Context): Promise<Data> {
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
