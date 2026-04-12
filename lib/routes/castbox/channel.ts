import crypto from 'node:crypto';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const PERMUTAION_MAP = [24, 13, 4, 19, 6, 0, 8, 21, 25, 7, 28, 1, 15, 31, 10, 9, 17, 18, 22, 11, 27, 23, 2, 26, 12, 5, 29, 14, 20, 30, 16, 3];

const getNonce = (params: Record<string, any>) => {
    const m = new Date().toISOString().slice(0, 10).replaceAll('-', '');

    const sortedKeys = Object.keys(params).toSorted();
    const queryParts = sortedKeys.map((k) => `${k}=${params[k]}`);
    const queryStr = queryParts.join('&');

    const hashInput = `${queryStr}evst${m}`;

    const md5Hex = crypto.createHash('md5').update(hashInput).digest('hex');

    const n = PERMUTAION_MAP.map((idx) => md5Hex[idx]).join('');

    return { m, n, queryStr };
};

export const route: Route = {
    path: '/channel/:channel',
    categories: ['multimedia'],
    example: '/castbox/channel/Lemonade-Stand-id6776228',
    parameters: {
        channel: 'Channel',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['castbox.fm/channel/:channel'],
            target: '/channel/:channel',
        },
    ],
    name: 'Channels',
    description: `Get the channel from the Castbox channel URL. For example, the URL of the channel "Lemonade Stand" is \`https://castbox.fm/channel/Lemonade-Stand-id6776228\`, where \`Lemonade-Stand-id6776228\` is the \`channel\` parameter.
    
    You can use the RSSHub global \`limit\` query parameter to specify the maximum number of episodes to fetch from the Castbox API (defaults to 50). For example: \`/castbox/channel/Lemonade-Stand-id6776228?limit=100\`.`,
    maintainers: ['ananyatimalsina'],
    handler: async (ctx) => {
        const { channel } = ctx.req.param();
        const cid = channel.split('-id')[1];

        if (!cid) {
            throw new Error('Invalid channel format. Missing -id');
        }

        const channelParams = { cid, r: 1, raw: 1, web: 1 };
        const { m: cm, n: cn, queryStr: cQuery } = getNonce(channelParams);

        const channelData = await ofetch(`https://everest.castbox.fm/data/channel/v3?${cQuery}&m=${cm}&n=${cn}`);

        if (!channelData?.data) {
            throw new Error('Failed to fetch channel data from Castbox');
        }

        const chData = channelData.data;
        const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string, 10) : 50;

        const epParams = { cid, limit, r: 1, raw: 1, web: 1 };
        const { m: em, n: en, queryStr: eQuery } = getNonce(epParams);

        const epData = await ofetch(`https://everest.castbox.fm/data/episode_list/v2?${eQuery}&m=${em}&n=${en}`);

        if (!epData?.data?.episode_list) {
            throw new Error('Failed to fetch episode list from Castbox');
        }

        const episodes = epData.data.episode_list;

        const items = episodes.map((ep: any) => {
            let enclosure_type = 'audio/mpeg';
            if (ep.video === 1 || ep.url?.includes('.mp4')) {
                enclosure_type = 'video/mp4';
            } else if (ep.url?.includes('.m4a')) {
                enclosure_type = 'audio/mp4';
            }

            return {
                title: ep.title,
                description: ep.description,
                pubDate: parseDate(ep.release_date),
                link: `https://castbox.fm/episode/${encodeURIComponent(ep.title)}-id${cid}-id${ep.eid}`,
                enclosure_url: ep.url,
                enclosure_type,
                enclosure_length: ep.size,
                itunes_item_image: ep.big_cover_url || ep.cover_url,
                itunes_duration: ep.duration ? Math.round(ep.duration / 1000) : undefined,
            };
        });

        return {
            title: chData.title,
            link: `https://castbox.fm/channel/${channel}`,
            description: chData.description,
            image: chData.big_cover_url || chData.small_cover_url,
            language: chData.language,
            itunes_author: chData.author,
            item: items,
        };
    },
};
