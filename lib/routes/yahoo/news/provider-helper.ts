import { Route } from '@/types';
import cache from '@/utils/cache';
import { getProviderList } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/providers/:region/list',
    categories: ['new-media'],
    example: '/yahoo/news/providers/tw/list',
    parameters: { region: '地区, 同路由"新闻来源"中的支持地区, 即 hk 或 tw' },
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
            source: ['hk.news.yahoo.com/', 'tw.news.yahoo.com/'],
        },
    ],
    name: '新聞來源列表',
    maintainers: ['TonyRL', 'williamgateszhao'],
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
