import { load } from 'cheerio';
import type { Context } from 'hono';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

async function loadContent(link, guid) {
    const res = await got({ method: 'get', url: link });
    const $ = load(res.data);
    const { data: videoDetail } = await got({
        method: 'get',
        url: `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${guid}`,
    });

    const description = `${$('meta[name=description]').attr('content')}<br><video src="${videoDetail.hls_url}" controls="controls"  style="width: 100%"></video>`;

    return { description };
}

const processFeed = (data, ctx: Context) => {
    let list = data.list;
    const limit = getRouteLimit(ctx);
    if (limit !== undefined) {
        if (ctx.req.query('sorted') !== 'false') {
            list = list.toSorted((a, b) => b.focus_date - a.focus_date);
        }
        list = list.slice(0, limit);
    }
    return Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const itemUrl = data.url;
            const itemDate = parseDate(data.focus_date);

            const single = {
                title,
                link: itemUrl,
                author: '央视新闻',
                guid: itemUrl,
                pubDate: itemDate,
            };

            const other = await cache.tryGet(itemUrl, () => loadContent(itemUrl, data.guid));

            return { ...single, ...other };
        })
    );
};
export const xinwen1j1 = async (ctx: Context) => {
    const baseUrl = 'https://api.cntv.cn/NewVideo/getVideoListByColumn?id=TOPC1451559066181661&n=20&sort=desc&p=1&mode=0&serviceId=tvcctv';
    const res = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Referer: 'https://tv.cctv.com/lm/xinwen1j1/videoset/index.shtml#&Type=0',
        },
    });

    const data = res.data.data;

    const result = await processFeed(data, ctx);

    return {
        title: '《新闻1+1》- 中央电视台新闻频道',
        link: 'https://tv.cctv.com/lm/xinwen1j1/videoset/index.shtml',
        description:
            '《新闻1+1》是中央电视台新闻频道的一档访谈类栏目。周一至周五，从时事政策、公共话题、突发事件等大型选题中选取当天最新、最热、最快的新闻话题，还原新闻全貌、解读事件真相，力求以精度、纯度和锐度为新闻导向，呈现最质朴的新闻。首播：CCTV-新闻：周一至周五21:30—21:55；重播：次日01:30，04:30。',
        item: result,
    };
};
