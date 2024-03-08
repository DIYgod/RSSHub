import { Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchActivityList, fetchDictionary } from './service';

export const route: Route = {
    path: '/event/:cityCode/:showStyle?',
    categories: ['game'],
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
    name: '演出更新',
    maintainers: ['lchtao26'],
    handler,
};

async function handler(ctx) {
    const cityCode = Number.parseInt(ctx.req.param('cityCode'));
    const showStyle = Number.parseInt(ctx.req.param('showStyle'));
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
