import { Route } from '@/types';
import cache from '@/utils/cache';
import { getArchive, getProviderList, parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/provider/:region/:providerId',
    categories: ['new-media'],
    example: '/yahoo/news/provider/tw/udn.com',
    parameters: { region: '地區，見下表', providerId: '新聞來源 ID，可透過下方新聞來源列表獲得' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新聞來源',
    maintainers: ['TonyRL'],
    handler,
    description: `| 香港 | 台灣 |
  | ---- | ---- |
  | hk   | tw   |`,
};

async function handler(ctx) {
    const { region, providerId } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new InvalidParameterError(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const providerList = await getProviderList(region, cache.tryGet);
    const provider = providerList.find((p) => p.key === providerId);

    const response = await getArchive(region, limit, null, providerId);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `Yahoo 新聞 - ${provider?.title ?? ''}`,
        link: provider?.link ?? `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
