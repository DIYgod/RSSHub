import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { getClientVal, sign } from './utils';

export const route: Route = {
    path: '/program/:programId',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/tingtingfm/program/M7VJv6Jj4R',
    parameters: { programId: '节目 ID，可以在 URL 中找到' },
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
            source: ['mobile.tingtingfm.com/v3/program/:programId'],
        },
    ],
    name: '节目',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const programId = ctx.req.param('programId');
    const apiBaseUrl = 'https://api-v3.tingtingfm.com';
    const mobileBaseUrl = 'https://mobile.tingtingfm.com';

    const params = {
        version: 'h5_5.16',
        client: getClientVal(30),
        h_program_id: programId,
    };

    const radioInfo = await cache.tryGet(`tingtingfm:program:${programId}`, async () => {
        // the double slash here and below is not a typo
        const { data: response } = await got.post(`${apiBaseUrl}//broadcast/get_program_v3_8`, {
            searchParams: {
                ...params,
                api_sign: sign(params),
            },
        });
        if (response.errno !== 0) {
            throw new Error(response.error);
        }

        return response.data.info;
    });

    const latestAudio = await cache.tryGet(
        `tingtingfm:audio_list:${programId}`,
        async () => {
            const { data: response } = await got.post(`${apiBaseUrl}//broadcast/get_program_audio_list`, {
                searchParams: {
                    ...params,
                    api_sign: sign(params),
                },
            });
            if (response.errno !== 0) {
                throw new Error(response.error);
            }

            return response.data[0];
        },
        config.cache.routeExpire,
        false
    );

    const audioList = await cache.tryGet(
        `tingtingfm:play_audio:${programId}`,
        async () => {
            const playAudioParams = {
                // remove h_program_id from params
                ...Object.fromEntries(Object.entries(params).filter(([key]) => key !== 'h_program_id')),
                type: '',
                sort: '-1',
                audio_id: latestAudio.h_audio_id,
            };
            const { data: response } = await got.post(`${apiBaseUrl}//albumaudio/play_audio`, {
                searchParams: {
                    ...playAudioParams,
                    api_sign: sign(playAudioParams),
                },
            });
            if (response.errno !== 0) {
                throw new Error(response.error);
            }

            return { radioCover: response.data.info.radio_cover, list: response.data.list };
        },
        config.cache.routeExpire,
        false
    );

    const { radioCover, list } = audioList;

    const items = list.map((audio) => ({
        title: audio.title,
        link: `${mobileBaseUrl}/v3/vod/2/${audio.h_audio_id}`,
        description: art(path.join(__dirname, 'templates/audio.art'), {
            url: audio.play_url,
        }),
        pubDate: parseDate(audio.add_time, 'X'),
        itunes_item_image: radioCover,
        itunes_duration: audio.duration,
        enclosure_url: audio.play_url,
        enclosure_type: 'audio/x-m4a',
    }));

    return {
        title: `${radioInfo.title} - ${radioInfo.belong_radio}${radioInfo.belong_fm}`,
        description: radioInfo.description,
        link: `${mobileBaseUrl}/v3/program/${programId}`,
        image: radioInfo.cover.split('?x-oss')[0],
        itunes_author: radioInfo.anchor.join(', '),
        itunes_category: radioInfo.category,
        itunes_explicit: false,
        item: items,
    };
}
