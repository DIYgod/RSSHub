import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/video/:id?',
    categories: ['bbs'],
    example: '/yicai/video',
    parameters: { id: '分类 id，见下表，可在对应分类页中找到，默认为视听' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['yicai.com/video/:id', 'yicai.com/video'],
        target: '/video/:id',
    },
    name: '视听',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    let channel;
    if (id) {
        const navUrl = `${rootUrl}/api/ajax/getnavs`;

        const response = await got({
            method: 'get',
            url: navUrl,
        });

        for (const c of response.data.header.video) {
            if (c.EnglishName === id || c.ChannelID === id) {
                channel = {
                    id: c.ChannelID,
                    name: c.ChannelName,
                    slug: c.EnglishName,
                };
                break;
            }
        }
    }

    const currentUrl = `${rootUrl}/video${id ? `/${channel.slug}` : ''}`;
    const apiUrl = `${rootUrl}/api/ajax/${id ? `getlistbycid?cid=${channel.id}` : 'getjuhelist?action=video'}&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: `第一财经 - ${channel?.name ?? '视听'}`,
        link: currentUrl,
        item: items,
    };
}
