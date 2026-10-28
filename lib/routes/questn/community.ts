import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/community/:communityUrl',
    name: 'Community Events',
    url: 'app.questn.com',
    maintainers: ['cxheng315'],
    example: '/questn/community/gmnetwork',
    parameters: {
        communityUrl: 'Community URL',
    },
    categories: ['other'],
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
            source: ['app.questn.com/:communityUrl'],
            target: '/community/:communityUrl',
        },
    ],
    handler,
};

async function handler(ctx) {
    const url = 'https://api.questn.com/consumer/explore/entity_list/';

    const requestedLimit = Number(ctx.req.query('limit'));
    const count = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20;
    const params = {
        count: String(count),
        page: '1',
        community_url: ctx.req.param('communityUrl') || 'questn', // default to questn
    };

    const response = await ofetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.result.data;

    const communityInfo = data[0]?.community_info;

    const items = data.map((item) => ({
        title: item.title,
        link: `https://app.questn.com/quest/${item.id}`,
        author: item.community_info ? item.community_info.name : '',
        guid: item.id,
        pubDate: parseDate(item.start_time * 1000),
    }));

    return {
        title: `QuestN Community - ${communityInfo?.name || params.community_url} Events`,
        link: `https://app.questn.com/${ctx.req.param('communityUrl')}`,
        description: communityInfo?.introduction,
        image: communityInfo?.logo,
        logo: communityInfo?.logo,
        item: items,
    };
}
