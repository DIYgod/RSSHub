import type { Context } from 'hono';

import type { Route } from '@/types';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:uid',
    categories: ['social-media'],
    example: '/meipai/user/56537299',
    parameters: { uid: '用户 id, 可在分享出去获得的用户主页 URL 中找到' },
    radar: [
        {
            source: ['www.meipai.com/user/:uid'],
            target: '/user/:uid',
        },
    ],
    name: '用户动态',
    maintainers: ['ihewro'],
    handler,
    url: 'www.meipai.com',
};

/* md5(path + sorted param values + salts),
 * then swap each pair of adjacent hex chars
 */
function sign(urlType: string, params: Record<string, string>) {
    const values = Object.entries(params)
        .filter(([key]) => !key.startsWith('sig'))
        .map(([, value]) => value)
        // oxlint-disable-next-line unicorn-js/require-array-sort-compare sig requires plain code-unit order, not locale order
        .toSorted();
    const hex = [...md5(`${urlType}${values.join('')}bdaefd747c7d594f${params.sigTime}Tw5AY783H@EU3#XC`)];
    for (let i = 0; i < hex.length; i += 2) {
        [hex[i], hex[i + 1]] = [hex[i + 1], hex[i]];
    }
    return hex.join('');
}

async function handler(ctx: Context) {
    const { uid } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;

    const urlType = 'medias/user_timeline.json';
    const now = String(Date.now());
    const params = {
        build: '16601',
        channel: '8888',
        client_id: '1089857299',
        country_code: 'CN',
        gnum: String(Math.floor(Math.random() * 9e16) + 1e16),
        language: 'zh-Hans',
        local_time: now,
        locale: '1',
        model: 'iPhone18,2',
        network: 'wifi',
        os: '27.0',
        resolution: '1320*2868',
        session_id: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16))
            .join('')
            .toUpperCase(),
        sigTime: now,
        sigVersion: '1.3',
        teenager_status: '0',
        version: '9.8.000',
        uid,
        count: String(limit),
        page: '1',
        /** Placeholder */
        sig: '',
    };
    params.sig = sign(urlType, params);

    const response = await ofetch(`https://api.meipai.com/${urlType}`, {
        query: params,
        headers: {
            'User-Agent': 'Meipai/9.8.000 (iPhone; iOS 27.0; Scale/3.00)',
            'Ab-Version': '5.2.0',
            // 'Ab-List': '1116',
            'Accept-Language': 'zh-Hans-CN;q=1',
        },
    });

    const item = response.map((media) => {
        const caption = (media.caption ?? '').replaceAll(/#([^#]+)#/g, '').trim();
        return {
            title: caption || media.cover_title || media.recommend_caption,
            description: `${caption}<br>${media.video ? `<video controls preload="metadata" poster="${media.cover_pic}"><source src="${media.video.replace('http:', 'https:')}" type="video/mp4"></video>` : `<img src="${media.cover_pic}">`}`,
            link: `https://www.meipai.com/media/${media.id}`,
            pubDate: parseDate(media.created_at, 'X'),
            author: media.user.screen_name,
            category: (media.caption ?? '')
                .matchAll(/#([^#]+)#/g)
                .toArray()
                .map((match) => match[1]),
            enclosure_url: media.video?.replace('http:', 'https:'),
            enclosure_type: 'video/mp4',
        };
    });

    const user = response[0]?.user;

    return {
        title: `${user?.screen_name ?? uid}的美拍`,
        link: `https://www.meipai.com/user/${uid}`,
        description: user?.weibo_share_caption,
        image: user?.avatar,
        item,
    };
}
