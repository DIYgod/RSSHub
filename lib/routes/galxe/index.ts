import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

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

    const response = await ofetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            variables: {
                alias,
                campaignInput: {
                    first: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50,
                    excludeChildren: true,
                    listType: 'Newest',
                },
            },
            query: `
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

    const space = response.data.space;

    const items = space.campaigns.list.map((campaign) => ({
        title: campaign.name,
        link: `https://app.galxe.com/quest/${alias}/${campaign.id}`,
        description: campaign.description,
        pubDate: campaign.startTime ? parseDate(campaign.startTime * 1000) : null,
    }));

    return {
        title: space.name,
        description: space.info,
        link: `https://app.galxe.com/quest/${alias}`,
        item: items,
        author: space.alias,
    };
}
