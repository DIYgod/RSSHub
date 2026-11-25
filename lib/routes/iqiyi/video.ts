import { randomUUID } from 'node:crypto';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { md5 } from '@/utils/hash';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

// /iqiyi/user/video/:uid
// http://localhost:1200/iqiyi/user/video/2289191062
export const route: Route = {
    path: '/user/video/:uid',
    categories: ['multimedia'],
    example: '/iqiyi/user/video/2289191062',
    parameters: { uid: '用户名' },
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
            source: ['iqiyi.com/u/:uid/*'],
        },
    ],
    name: '用户视频',
    maintainers: ['talengu', 'JimenezLi'],
    handler,
};

const apiHost = 'iqiyihao.iqiyi.com';
const salt = 'NZrFGv72GYppTUxO';

const request = (path: string, params: Record<string, string | number>, deviceId: string) => {
    const allParams = {
        agenttype: 118,
        agentversion: '10.7.5',
        timestamp: Temporal.Now.instant().epochMilliseconds,
        m_device_id: deviceId,
        ...params,
    };
    const query = Object.keys(allParams)
        .toSorted()
        .map((key) => `${key}=${allParams[key]}`)
        .join('&');
    return ofetch(`https://${apiHost}${path}?${query}&sign=${md5(`GET${apiHost}${path}?${query}${salt}`)}`, { headers: { Referer: 'https://www.iqiyi.com/' } });
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const link = `https://www.iqiyi.com/u/${uid}/videos`;

    const data = await cache.tryGet(
        link,
        async () => {
            const deviceId = randomUUID().replaceAll('-', '');
            const home = await request('/iqiyihao/home.action', { iqiyi_uid: uid }, deviceId);
            const works = await request('/iqiyihao/entity/get_works.action', { fuid: uid, page: 1, size: 16 }, deviceId);
            const ids: number[] = works.data.sort.flows.map((flow) => flow.qipuId);
            const entities = await request('/iqiyihao/entity/get_entity_by_ids.action', { ids: ids.join(','), ownerUid: uid }, deviceId);

            return {
                title: `${home.data.name}的视频 - 爱奇艺`,
                description: home.data.description,
                link,
                item: ids.map((id) => {
                    const video = entities.data[id].object;
                    return {
                        title: video.title,
                        description: video.description,
                        pubDate: parseDate(video.publishTime),
                        link: video.pageUrl,
                        image: video.thumbnail,
                    };
                }),
            };
        },
        config.cache.routeExpire,
        false
    );
    return data;
}
