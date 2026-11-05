import type { Context } from 'hono';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const getMzzlbg = async (ctx: Context) => {
    const url = 'https://api.cntv.cn/video/videolistById?serviceId=cbox&vsid=C10354&em=01&p=1&n=50';

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const limit = getRouteLimit(ctx);
    let videos = data.video;
    if (limit !== undefined) {
        if (ctx.req.query('sorted') !== 'false') {
            videos = videos.toSorted((a, b) => (b.ptime ? +parseDate(b.ptime) : 0) - (a.ptime ? +parseDate(a.ptime) : 0));
        }
        videos = videos.slice(0, limit);
    }

    const resultItem = await Promise.all(
        videos.map(async (video) => {
            const url = `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${video.vid}`;
            const item = {
                title: video.t,
                description: video.desc,
                link: video.url,
                pubDate: video.ptime ? timezone(parseDate(video.ptime), 8) : undefined,
            };
            const videoDetail = await cache.tryGet(url, async () => {
                const { data } = await got(url);
                return data;
            });

            item.description += `<br><video src="${videoDetail.hls_url}" controls="controls" poster="${video.img.replaceAll(/\?.+/g, '')}" style="width: 100%"></video>`;
            return item;
        })
    );

    return {
        title: '每周质量报告',
        link: 'https://tv.cctv.com/lm/mzzlbg/videoset/index.shtml',
        description:
            '《每周质量报告》是CCTV-新闻频道一档以消费者为核心收视人群的新闻专题栏目。创办于2003年，始终致力于产品质量和食品安全领域的调查报道，以打假除劣扶优，推动质量进步为第一诉求，是我国电视新闻界质量新闻领域的旗帜性节目。首播时间：CCTV-新闻周日12:35—12:55。',
        item: resultItem,
    };
};
