// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export default async (ctx) => {
    const fid = ctx.req.param('fid');
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');

    const response = await got({
        url: `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${fid}&ps=20`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: config.bilibili.cookies[uid],
        },
    });
    const { data, code, message } = response.data;
    if (code) {
        throw new Error(message ?? code);
    }

    const userName = data.info.upper.name;
    const favName = data.info.title;

    ctx.set('data', {
        title: `${userName} 的 bilibili 收藏夹 ${favName}`,
        link: `https://space.bilibili.com/${uid}/#/favlist?fid=${fid}`,
        description: `${userName} 的 bilibili 收藏夹 ${favName}`,

        item:
            data.medias &&
            data.medias.map((item) => ({
                title: item.title,
                description: `${item.intro}${disableEmbed ? '' : `<br><br>${utils.iframe(item.id)}`}<br><img src='${item.cover}'>`,
                pubDate: parseDate(item.fav_time * 1000),
                link: item.fav_time > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
                author: item.upper.name,
            })),
    });
};
