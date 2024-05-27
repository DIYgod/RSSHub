import { Route } from '@/types';
import cache from '@/utils/cache';
import { getProviderList } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/providers/:region',
    categories: ['new-media'],
    example: '/yahoo/news/providers/tw',
    parameters: { region: '地區，見上表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新聞來源列表',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const region = ctx.req.param('region');
    if (!['hk', 'tw'].includes(region)) {
        throw new InvalidParameterError(`Unknown region: ${region}`);
    }

    const providerList = await getProviderList(region, cache.tryGet);

    const items = providerList.map((provider) => ({
        ...provider,
        description: provider.key,
    }));

    return {
        title: 'Yahoo 新聞 - 新聞來源列表',
        link: `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
