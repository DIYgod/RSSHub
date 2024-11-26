import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { baseUrl, parseList, parseItems } from './utils';

export const route: Route = {
    path: '/today/:edition/publisher/:id',
    categories: ['new-media', 'popular'],
    example: '/line/today/th/publisher/101048',
    parameters: { edition: 'Edition, see table above', id: 'Channel ID, can be found in URL' },
    radar: [
        {
            source: ['today.line.me/:edition/v2/publisher/:id'],
        },
    ],
    name: 'TODAY - Channel',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { edition, id } = ctx.req.param();

    const publisherInfo = await ofetch(`${baseUrl}/webapi/portal/page/setting`, {
        query: {
            entityId: id,
            country: edition,
            pageType: 'CP',
        },
    });

    let thaiData;
    if (edition === 'th') {
        thaiData = await ofetch(`${baseUrl}/webapi/portal/embedded/page/cplatest`, {
            query: {
                entityId: id,
                pageType: 'CP',
                country: edition,
            },
        });
    }

    const modules = edition === 'th' ? thaiData.modules : publisherInfo.modules;
    const mod = modules.find((item) => item.source === 'CP_LATEST');
    const listing = mod.listings[0];

    const listResponse = await ofetch(`${baseUrl}/webapi/trending/cp/latest/listings/${mod.id}`, {
        query: {
            offset: listing.offset,
            length: listing.length,
            country: edition,
            targetContent: listing.params?.targetContent,
            cps: listing.params?.cps,
            publishedWithin: listing.params?.publishedWithin,
        },
    });

    const list = parseList(listResponse.items);

    const items = await parseItems(list);

    return {
        title: `${publisherInfo.data.name} - Line Today`,
        description: publisherInfo.data.introduction,
        image: publisherInfo.data.icon ? `https://obs.line-scdn.net/${publisherInfo.data.icon.hash}` : undefined,
        link: `${baseUrl}/${edition}/v2/publisher/${id}`,
        item: items,
    };
}
