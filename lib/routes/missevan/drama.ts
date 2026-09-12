import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/drama/:id',
    categories: ['multimedia'],
    example: '/missevan/drama/43922',
    parameters: { id: '剧集 id，在剧集主页 URL 中可以找到' },
    name: '广播剧',
    maintainers: ['FlashWingShadow'],
    handler,
};

const host = 'www.missevan.com';

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const dramaUrl = `https://${host}/dramaapi/getdrama?drama_id=${id}`;
    const dramaResp = await ofetch(dramaUrl);

    const items = await Promise.all(
        dramaResp.info.episodes.episode.map((item) => {
            const soundUrl = `https://www.missevan.com/sound/getsound?soundid=${item.sound_id}`;
            return cache.tryGet(soundUrl, async () => {
                const soundResponse = await ofetch(soundUrl);
                const soundData = soundResponse.info.sound;
                return {
                    title: item.name,
                    enclosure_url: soundData.soundurl,
                    itunes_duration: Math.trunc(soundData.duration / 1000),
                    enclosure_type: 'audio/mpeg',
                    image: dramaResp.info.drama.cover,
                    itunes_author: soundData.username,
                    itunes_category: '',
                    link: `https://www.missevan.com/sound/player?id=${item.sound_id}`,
                    description: `<img src=${dramaResp.info.drama.cover}><br>${soundData.intro}`,
                    pubDate: parseDate(soundData.last_update_time * 1000),
                };
            });
        })
    );

    return {
        title: dramaResp.info.drama.name,
        link: `https://${host}/mdrama/drama/${id}`,
        image: dramaResp.info.drama.cover,
        description: dramaResp.info.drama.abstract,
        item: items,
    };
}
