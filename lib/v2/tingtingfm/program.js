const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const { join } = require('path');
const { parseDate } = require('@/utils/parse-date');
const { getClientVal, sign } = require('./utils');

module.exports = async (ctx) => {
    const { programId } = ctx.params;
    const apiBaseUrl = 'https://api-v3.tingtingfm.com';
    const mobileBaseUrl = 'https://mobile.tingtingfm.com';

    const params = {
        version: 'h5_5.16',
        client: getClientVal(30),
        h_program_id: programId,
    };

    const radioInfo = await ctx.cache.tryGet(`tingtingfm:program:${programId}`, async () => {
        // the double slash here and below is not a typo
        const { data: response } = await got.post(`${apiBaseUrl}//broadcast/get_program_v3_8`, {
            searchParams: {
                ...params,
                api_sign: sign(params),
            },
        });
        if (response.errno !== 0) {
            throw Error(response.error);
        }

        return response.data.info;
    });

    const latestAudio = await ctx.cache.tryGet(
        `tingtingfm:audio_list:${programId}`,
        async () => {
            const { data: response } = await got.post(`${apiBaseUrl}//broadcast/get_program_audio_list`, {
                searchParams: {
                    ...params,
                    api_sign: sign(params),
                },
            });
            if (response.errno !== 0) {
                throw Error(response.error);
            }

            return response.data[0];
        },
        config.cache.routeExpire,
        false
    );

    const audioList = await ctx.cache.tryGet(
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
                throw Error(response.error);
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
        description: art(join(__dirname, 'templates/audio.art'), {
            url: audio.play_url,
        }),
        pubDate: parseDate(audio.add_time, 'X'),
        itunes_item_image: radioCover,
        itunes_duration: audio.duration,
        enclosure_url: audio.play_url,
        enclosure_type: 'audio/x-m4a',
    }));

    ctx.state.data = {
        title: `${radioInfo.title} - ${radioInfo.belong_radio}${radioInfo.belong_fm}`,
        description: radioInfo.description,
        link: `${mobileBaseUrl}/v3/program/${programId}`,
        image: radioInfo.cover.split('?x-oss')[0],
        itunes_author: radioInfo.anchor.join(', '),
        itunes_category: radioInfo.category,
        itunes_explicit: false,
        item: items,
    };
};
