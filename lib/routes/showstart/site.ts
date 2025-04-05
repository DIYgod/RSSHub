import { Data, Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchActivityList, fetchSiteInfo } from './service';
import { Context } from 'hono';

export const route: Route = {
    path: '/site/:siteId',
    categories: ['shopping'],
    example: '/showstart/site/3583',
    parameters: { siteId: '演出场地 (编号)' },
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
            source: ['www.showstart.com/venue/:id'],
        },
    ],
    name: '按场地 - 演出更新',
    maintainers: ['lchtao26'],
    handler,
    description: `::: tip
-   演出场地 ID 查询: \`/showstart/search/site/:keyword\`, 如: [https://rsshub.app/showstart/search/site/酒球会](https://rsshub.app/showstart/search/site/酒球会)
:::`,
};

async function handler(ctx: Context): Promise<Data> {
    const siteId = Number.parseInt(ctx.req.param('siteId')).toString();
    const [activityList, siteInfo] = await Promise.all([fetchActivityList({ siteId }), fetchSiteInfo({ siteId })]);
    return {
        title: `${TITLE} - ${siteInfo.name}`,
        description: siteInfo.address,
        link: HOST,
        item: activityList,
    };
}
