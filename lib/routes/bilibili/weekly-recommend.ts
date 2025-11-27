import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDuration } from '@/utils/helpers';

import cache from './cache';
import utils, { getVideoUrl } from './utils';

export const route: Route = {
    path: '/weekly/:embed?',
    categories: ['social-media'],
    example: '/bilibili/weekly',
    parameters: { embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'B 站每周必看',
    maintainers: ['ttttmr'],
    handler,
};

async function handler(ctx) {
    const isJsonFeed = ctx.req.query('format') === 'json';
    const embed = !ctx.req.param('embed');

    const status_response = await got({
        method: 'get',
        url: 'https://app.bilibili.com/x/v2/show/popular/selected/series?type=weekly_selected',
        headers: {
            Referer: 'https://www.bilibili.com/h5/weekly-recommend',
        },
    });
    const weekly_number = status_response.data.data[0].number;
    const weekly_name = status_response.data.data[0].name;

    const response = await got({
        method: 'get',
        url: `https://app.bilibili.com/x/v2/show/popular/selected?type=weekly_selected&number=${weekly_number}`,
        headers: {
            Referer: `https://www.bilibili.com/h5/weekly-recommend?num=${weekly_number}&navhide=1`,
        },
    });
    const data = response.data.data.list;

    return {
        title: 'B站每周必看',
        link: 'https://www.bilibili.com/h5/weekly-recommend',
        description: 'B站每周必看',
        item: data.map(async (item) => {
            const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && item.bvid ? await cache.getVideoSubtitleAttachment(item.bvid) : [];
            return {
                title: item.title,
                description: utils.renderUGCDescription(embed, item.cover, `${weekly_name} ${item.title} - ${item.rcmd_reason}`, item.param, undefined, item.bvid),
                link: weekly_number > 60 && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.param}`,
                attachments: item.bvid
                    ? [
                          {
                              url: getVideoUrl(item.bvid),
                              mime_type: 'text/html',
                              duration_in_seconds: parseDuration(item.cover_right_text_1),
                          },
                          ...subtitles,
                      ]
                    : undefined,
            };
        }),
    };
}
