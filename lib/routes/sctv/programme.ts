import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/programme/:id?/:limit?/:isFull?',
    categories: ['bbs'],
    example: '/sctv/programme/1',
    parameters: { id: '节目 id，可在对应节目页中找到，默认为 `1`，即四川新闻联播', limit: '期数，默认为 15，即单次获取最新 15 期', isFull: '是否仅获取完整视频，填写 true/yes 表示是、false/no 表示否，默认是' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电视回放',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';
    const limit = ctx.req.param('limit') ? Number.parseInt(ctx.req.param('limit')) : 15;
    const isFull = /t|y/i.test(ctx.req.param('isFull') ?? 'true');

    const rootUrl = 'https://www.sctv.com';
    const apiRootUrl = 'https://kscgc.sctv-tf.com';
    const apiUrl = `${apiRootUrl}/sctv/lookback/${id}/date.json`;
    const listUrl = `${apiRootUrl}/sctv/lookback/index/lookbackList.json`;
    const currentUrl = `${rootUrl}/column/detail?programmeIndex=/sctv/lookback/${id}/index.json`;

    let response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = [];

    const array = response.data.data.programmeArray.slice(0, limit).map((list) => ({
        guid: list.id,
        link: `${apiRootUrl}${list.programmeListUrl}`,
    }));

    await Promise.all(
        array.map((list) =>
            cache.tryGet(list.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: list.link,
                });

                const currentItems = detailResponse.data.data.programmeList.map((item) => ({
                    guid: item.id,
                    title: item.programmeTitle,
                    link: item.programmeUrl,
                    pubDate: timezone(parseDate(item.pubTime), +8),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        cover: item.programmeImage,
                        video: item.programmeUrl,
                    }),
                }));

                let currentFullItems = [];

                if (isFull) {
                    currentFullItems = currentItems.filter((item) => /（\d{4}(?:\.\d{2}){2}）/.test(item.title));
                }

                items = [...items, ...(currentFullItems.length === 0 ? currentItems : currentFullItems)];
            })
        )
    );

    response = await got({
        method: 'get',
        url: listUrl,
    });

    let name, cover;
    for (const p of response.data.data.programme_official) {
        if (p.programmeId === id) {
            name = p.programmeName;
            cover = p.programmeCover;
            break;
        }
    }

    return {
        title: `四川广播电视台 - ${name}`,
        link: currentUrl,
        item: items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100),
        image: cover,
    };
}
