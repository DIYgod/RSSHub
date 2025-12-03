import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/edge/addon/:crxid',
    categories: ['program-update'],
    example: '/microsoft/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln',
    parameters: { crxid: 'Addon id, can be found in addon url' },
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
            source: ['microsoftedge.microsoft.com/addons/detail/:name/:crxid'],
        },
    ],
    name: 'Addons Update',
    maintainers: ['hoilc', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const crxid = ctx.req.param('crxid');

    const pageUrl = `https://microsoftedge.microsoft.com/addons/detail/${crxid}`;

    const data = await ofetch(`https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/${crxid}?hl=en`, {
        headers: {
            Referer: pageUrl,
        },
    });

    return {
        title: `${data.name} - Microsoft Edge Addons`,
        description: data.shortDescription,
        image: `https:${data.logoUrl}`,
        link: pageUrl,
        item: [
            {
                title: 'v' + data.version,
                author: data.developer,
                description: data.description,
                pubDate: new Date(data.lastUpdateDate * 1000),
                guid: `edge::${crxid}::${data.version}`,
                link: pageUrl,
            },
        ],
    };
}
