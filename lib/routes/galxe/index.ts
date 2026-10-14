import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/quest/:alias',
    name: 'Quest',
    url: 'app.galxe.com',
    maintainers: ['cxheng315'],
    example: '/galxe/quest/MissionWeb3',
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
            source: ['app.galxe.com/quest/:alias'],
            target: '/quest/:alias',
        },
    ],
    handler,
};

async function handler(ctx) {
    const url = 'https://graphigo.prd.galaxy.eco/query';

    const alias = ctx.req.param('alias');
    const limit = getRouteLimit(ctx, 50);
    // The source's Newest order can differ from the campaign start-time order.
    const first = ctx.req.query('sorted') === 'false' ? limit : Math.max(50, limit);

    const response = await ofetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            variables: {
                alias,
                campaignInput: {
                    first,
                    excludeChildren: true,
                    listType: 'Newest',
                },
            },
            query: /* GraphQL */ `
                query BrowseSpaceCampaigns($id: Int, $alias: String, $campaignInput: ListCampaignInput!) {
                    space(id: $id, alias: $alias) {
                        id
                        name
                        alias
                        info
                        campaigns(input: $campaignInput) {
                            list {
                                startTime
                                endTime
                                id
                                name
                                description
                                __typename
                            }
                            pageInfo {
                                endCursor
                                hasNextPage
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                }
            `,
        },
    });

    const space = response.data?.space;
    if (!space) {
        const reason = response.errors?.map((error) => error.message).join('; ') ?? 'The API did not return space data';
        const message = `Cannot load Galxe space "${alias}": ${reason}. Check https://app.galxe.com/quest/${alias}`;
        if (response.errors?.some((error) => error.extensions?.code === 'NotFound')) {
            throw new InvalidParameterError(message);
        }
        throw new Error(message);
    }

    const items = space.campaigns.list.map((campaign) => ({
        title: campaign.name,
        link: `https://app.galxe.com/quest/${alias}/${campaign.id}`,
        description: campaign.description,
        pubDate: campaign.startTime ? parseDate(campaign.startTime * 1000) : undefined,
    }));

    return {
        title: space.name,
        description: space.info,
        link: `https://app.galxe.com/quest/${alias}`,
        item: items,
        author: space.alias,
    };
}
