import crypto from 'node:crypto';

import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface Program {
    id: number;
    title: string;
    cover: string;
    duration: number;
    update_time: string;
    isfree: boolean;
}

const qingtingId = config.qingting.id ?? '';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia'],
    example: '/qingting/podcast/293411',
    parameters: { id: '专辑id, 可在专辑页 URL 中找到' },
    features: {
        supportPodcast: true,
        requireConfig: [
            {
                name: 'QINGTING_ID',
                optional: true,
                description: '用户id， 部分专辑需要会员身份，用户id可以通过从网页端登录蜻蜓fm后使用开发者工具，在控制台中运行JSON.parse(localStorage.getItem("user")).qingting_id获取',
            },
        ],
    },
    radar: [
        {
            source: ['qingting.fm/channels/:id'],
        },
    ],
    name: '播客',
    maintainers: ['RookieZoe', 'huyyi', 'pseudoyu'],
    handler,
    description: '获取的播放 URL 有效期只有 1 天，需要开启播客 APP 的自动下载功能。',
};

function getMediaUrl(channelId: string, mediaId: number) {
    const path = `/audiostream/redirect/${channelId}/${mediaId}?access_token=&device_id=MOBILESITE&qingting_id=${qingtingId}&t=${Date.now()}`;
    const sign = crypto.createHmac('md5', 'fpMn12&38f_2e').update(path).digest('hex');
    return `https://audio.qingting.fm${path}&sign=${sign}`;
}

async function handler(ctx) {
    const channelId = ctx.req.param('id');
    const limit = Number(ctx.req.query('limit'));
    const pageSize = Number.isSafeInteger(limit) && limit > 0 ? limit : 30;

    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${channelId}`;
    const response = await ofetch(channelUrl, {
        headers: {
            Referer: 'https://www.qingting.fm/',
        },
    });

    const title = response.data.title;
    const channel_img = response.data.thumbs['400_thumb'];
    const authors = response.data.podcasters.map((author) => author.nick_name).join(',');
    const desc = response.data.description;
    const programUrl = `https://i.qingting.fm/capi/channel/${channelId}/programs/${response.data.v}?curpage=1&pagesize=${pageSize}&order=asc`;

    const {
        data: { programs },
    } = await ofetch<{ data: { programs: Program[] } }>(programUrl, {
        headers: {
            Referer: 'https://www.qingting.fm/',
        },
    });

    const { data: channelInfo } = await ofetch(`https://i.qingting.fm/capi/v3/channel/${channelId}?user_id=${qingtingId}`);

    const isCharged = channelInfo.purchase?.item_type !== 0;

    const isPaid = channelInfo.user_relevance?.sale_status === 'paid';

    const resultItems = await pMap(
        programs,
        async (item) => {
            const data = await cache.tryGet(`qingting:podcast:${channelId}:${item.id}`, async (): Promise<DataItem> => {
                const link = `https://www.qingting.fm/channels/${channelId}/programs/${item.id}/`;

                const detailRes = await ofetch(link, { allowH2: false });

                const detail = JSON.parse(detailRes.match(/\},"program":(.*?),"plist":/)[1]);

                const rssItem = {
                    title: item.title,
                    link,
                    itunes_item_image: item.cover,
                    itunes_duration: item.duration,
                    pubDate: timezone(parseDate(item.update_time), 8),
                    description: detail.richtext,
                };

                return rssItem;
            });

            if (!isCharged || isPaid || item.isfree) {
                data.enclosure_url = getMediaUrl(channelId, item.id);
                data.enclosure_type = 'audio/mpeg';
            }

            return data;
        },
        { concurrency: 3 }
    );

    return {
        title: `${title} - 蜻蜓FM`,
        description: desc,
        itunes_author: authors,
        image: channel_img,
        link: `https://www.qingting.fm/channels/${channelId}`,
        item: resultItems,
    };
}
