import { Data, Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchActivityList, fetchDictionary } from './service';
import type { Context } from 'hono';

export const route: Route = {
    path: '/event/:cityCode/:showStyle?',
    categories: ['shopping'],
    example: '/showstart/event/571/3',
    parameters: { cityCode: '演出城市 (编号)', showStyle: '演出风格 (编号)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '按城市 - 演出更新',
    maintainers: ['lchtao26'],
    handler,
    description: `::: tip
-   演出城市 \`cityCode\` 查询: \`/showstart/search/city/:keyword\`, 如: [https://rsshub.app/showstart/search/city/杭州](https://rsshub.app/showstart/search/city/杭州)

-   演出风格 \`showStyle\` 查询: \`/showstart/search/style/:keyword\`，如: [https://rsshub.app/showstart/search/style/摇滚](https://rsshub.app/showstart/search/style/摇滚)
:::`,
};

async function handler(ctx: Context): Promise<Data> {
    const cityCode = Number.parseInt(ctx.req.param('cityCode')).toString();
    const showStyle = Number.parseInt(ctx.req.param('showStyle')).toString();
    const items = await fetchActivityList({
        cityCode,
        showStyle,
    });
    const { cityName, showName } = await fetchDictionary(cityCode, showStyle);
    const tags = [cityName, showName].filter(Boolean).join(' - ');
    return {
        title: `${TITLE} - ${tags}`,
        link: HOST,
        item: items,
    };
}
