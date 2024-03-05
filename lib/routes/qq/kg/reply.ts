// @ts-nocheck
const cache = require('./cache');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const playId = ctx.req.param('playId');
    const url = `https://node.kg.qq.com/play?s=${playId}`;
    const play_item = await cache.getPlayInfo(ctx, playId, '');

    ctx.set('data', {
        title: `${play_item.name} - ${play_item.author} 的评论`,
        link: url,
        image: play_item.itunes_item_image,
        allowEmpty: true,
        item: play_item.comments.map((item) => ({
            title: `${item.nick}：${item.content}`,
            pubDate: parseDate(item.ctime * 1000),
            link: url,
            guid: `ksong:${play_item.ksong_mid}:${item.comment_id}`,
        })),
    });
};
