import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/drama/latest',
    categories: ['multimedia'],
    example: '/missevan/drama/latest',
    name: '最新广播剧',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://www.missevan.com/dramaapi/filter?filters=0_0_0_0_0&page=1&order=1&page_size=20';
    const response = await ofetch<{ info: { Datas: Array<{ id: number; newest: string; name: string; integrity: number; cover: string }> } }>(link);

    const items = await pMap(
        response.info.Datas,
        async (item) => {
            const dramaUrl = `https://www.missevan.com/dramaapi/getdrama?drama_id=${item.id}`;
            const dramaResponse = await ofetch(dramaUrl);
            const soundId = dramaResponse.info?.episodes?.episode?.[0]?.sound_id;
            if (!soundId) {
                return;
            }
            const soundData = await cache.tryGet(`missevan:sound:v1:${soundId}`, async () => {
                const soundResponse = await ofetch(`https://www.missevan.com/sound/getsound?soundid=${soundId}`);
                return soundResponse.info.sound;
            });
            return {
                title: item.name + (item.integrity === 3 ? '（已完结）' : '（更新至 ' + item.newest + '）'),
                enclosure_url: soundData.soundurl,
                itunes_duration: Math.trunc(soundData.duration / 1000),
                enclosure_type: 'audio/mpeg',
                image: item.cover,
                itunes_author: soundData.username,
                itunes_category: '',
                link: `https://www.missevan.com/sound/player?id=${soundId}`,
                description: `<img src=${item.cover}><br>${soundData.intro}`,
                pubDate: parseDate(soundData.last_update_time * 1000),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '猫耳FM - 最新广播剧',
        link: 'https://www.missevan.com/mdrama',
        item: items.filter((item) => item !== undefined),
    };
}
