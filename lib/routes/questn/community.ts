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
        community_url: 'Community URL',
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

    const params = {
        count: ctx.req.query('limit') || '20',
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

    const items = data.map((item) => ({
        title: item.title,
        link: `https://app.questn.com/quest/${item.id}`,
        author: item.community_info ? item.community_info.name : '',
        guid: item.id,
        pubDate: parseDate(item.start_time * 1000),
        itunes_duration: item.end_time > 0 ? item.end_time - item.start_time : 0,
    }));

    return {
        title: `QuestN Community - ${data[0].community_info ? data[0].community_info.name : ''} Events`,
        link: `https://app.questn.com/${ctx.req.param('community_url')}`,
        description: data[0].community_info ? data[0].community_info.introduction : '',
        image: data[0].community_info ? data[0].community_info.logo : '',
        logo: data[0].community_info ? data[0].community_info.logo : '',
        item:
            items && items.length > 0
                ? items
                : [
                      {
                          title: 'No events found',
                          link: `https://app.questn.com/${ctx.req.param('community_url')}`,
                          description: 'No events found',
                      },
                  ],
    };
}
