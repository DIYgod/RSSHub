// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const disableEmbed = ctx.req.param('disableEmbed');
    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`,
        headers: {
            Referer: link,
        },
    });

    const { title: name, pages: data } = response.data.data;

    ctx.set('data', {
        title: `视频 ${name} 的选集列表`,
        link,
        description: `视频 ${name} 的视频选集列表`,
        item: data
            .sort((a, b) => b.page - a.page)
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
            .map((item) => ({
                title: item.part,
                description: `${item.part} - ${name}${disableEmbed ? '' : `<br><br>${utils.iframe(aid, item.page, bvid)}`}`,
                link: `${link}?p=${item.page}`,
            })),
    });
};
