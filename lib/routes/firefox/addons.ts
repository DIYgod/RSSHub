import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/addons/:id',
    categories: ['program-update'],
    example: '/firefox/addons/rsshub-radar',
    parameters: { id: 'Add-ons id, can be found in add-ons url' },
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
            source: ['addons.mozilla.org/:lang/firefox/addon/:id/versions', 'addons.mozilla.org/:lang/firefox/addon/:id'],
        },
    ],
    name: 'Add-ons Update',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
    });
    const data = JSON.parse(load(response.data)('#redux-store-state').text());
    const info = data.addons.byID[data.addons.bySlug[id]];
    const versionIds = data.versions.bySlug[id].versionIds;

    return {
        title: `${info.name} - Firefox Add-on`,
        description: info.summary || info.description,
        link: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
        item:
            versionIds &&
            versionIds.map((versionId) => {
                const versionInfo = data.versions.byId[versionId];
                const version = 'v' + versionInfo.version;
                return {
                    title: version,
                    description: versionInfo.releaseNotes || '',
                    link: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
                    pubDate: new Date(versionInfo.file.created),
                    guid: version,
                    author: info.authors.map((author) => author.name).join(', '),
                    category: info.categories,
                };
            }),
    };
}
