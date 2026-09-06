import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:id',
    categories: ['multimedia'],
    example: '/lizhi/user/27151442948222380',
    parameters: { id: '用户 id，可以在电台的 URL 中找到' },
    name: '电台更新',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '10');

    const { data } = await ofetch(`https://m.lizhi.fm/vodapi/user/${id}`, {
        query: {
            pageNo: 1,
            pageSize: limit,
        },
    });

    const items = data.map((item) => ({
        title: item.voiceInfo.name,
        description: item.voiceDetailProperty.text,
        link: `https://www.lizhi.fm/voice/${item.voiceInfo.voiceId}?band=${item.userInfo.band}`,
        pubDate: parseDate(item.voiceInfo.createTime * 1000),
        enclosure_url: item.voicePlayProperty.trackUrl,
        enclosure_type: 'audio/mpeg',
        itunes_duration: item.voiceInfo.duration,
        itunes_item_image: item.voiceInfo.imageUrl,
        category: item.voiceInfo.lableName,
    }));

    const { userInfo } = data[0];

    return {
        title: `荔枝FM - ${userInfo.name}`,
        link: `https://www.lizhi.fm/user/${id}`,
        itunes_author: userInfo.name,
        image: userInfo.photo,
        item: items,
    };
}
