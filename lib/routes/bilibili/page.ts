import { FetchError } from 'ofetch';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import utils from './utils';

export const route: Route = {
    path: '/video/page/:bvid/:embed?/:sort?',
    categories: ['social-media'],
    example: '/bilibili/video/page/BV1i7411M7N9',
    parameters: { bvid: '可在视频页 URL 中找到', embed: '默认为开启内嵌视频, 任意值为关闭', sort: '选集排序：desc（默认，降序）或 asc（升序）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频选集列表',
    maintainers: ['sxzz'],
    handler,
    description: '默认返回最近 10 个分 P，可使用通用参数 `limit` 增加条数。使用 `/:embed/asc` 可按选集顺序升序输出。',
};

async function handler(ctx) {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const embed = !ctx.req.param('embed');
    const sort = ctx.req.param('sort') ?? 'desc';
    if (sort !== 'asc' && sort !== 'desc') {
        throw new InvalidParameterError('Sort must be asc or desc');
    }
    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const query = bvid ? `bvid=${bvid}` : `aid=${aid}`;
    let respdata;
    try {
        const response = await got(`https://api.bilibili.com/x/web-interface/view?${query}`, {
            headers: { Referer: link },
        });
        respdata = response.data.data;
    } catch (error) {
        if (!(error instanceof FetchError) || error.response?.status !== 412) {
            throw error;
        }
        const response = await got(`https://api.bilibili.com/x/player/pagelist?${query}`, {
            headers: { Referer: link },
        });
        if (response.data.code !== 0 || !Array.isArray(response.data.data)) {
            throw new Error(`Bilibili page list request failed: code = ${response.data.code}, message = ${response.data.message}`, { cause: error });
        }
        respdata = { title: bvid || `av${aid}`, aid, bvid, pages: response.data.data };
    }
    const { title: name, pages: data } = respdata;

    return {
        title: `视频 ${name} 的选集列表`,
        link,
        description: `视频 ${name} 的视频选集列表`,
        item: data
            .toSorted((a, b) => (sort === 'asc' ? a.page - b.page : b.page - a.page))
            .slice(0, getRouteLimit(ctx, 10))
            .map((item) => ({
                title: item.part,
                description: utils.renderUGCDescription(embed, respdata.pic ?? '', `${item.part} - ${name}`, respdata.aid, item.cid, respdata.bvid),
                link: `${link}?p=${item.page}`,
            })),
    };
}
