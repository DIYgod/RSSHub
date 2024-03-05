// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

const notFoundData = {
    title: '此 bilibili 频道不存在',
};

export default async (ctx) => {
    const uid = Number.parseInt(ctx.req.param('uid'));
    const sid = Number.parseInt(ctx.req.param('sid'));
    const disableEmbed = ctx.req.param('disableEmbed');
    const limit = ctx.req.query('limit') ?? 25;

    const link = `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`;
    const [userName, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);
    const host = `https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=${uid}&season_id=${sid}&sort_reverse=true&page_num=1&page_size=${limit}`;

    const response = await got(host, {
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;
    if (!data.archives) {
        ctx.set('data', notFoundData);
        return;
    }

    ctx.set('data', {
        title: `${userName} 的 bilibili 合集 ${data.meta.name}`,
        link,
        description: `${userName} 的 bilibili 合集`,
        logo: face,
        icon: face,
        item: data.archives.map((item) => {
            const descList = [];
            if (!disableEmbed) {
                descList.push(utils.iframe(item.aid));
            }
            descList.push(`<img src="${item.pic}">`);
            return {
                title: item.title,
                description: descList.join('<br>'),
                pubDate: parseDate(item.pubdate, 'X'),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: userName,
            };
        }),
    });
};
