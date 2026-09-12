import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseScriptData } from '@/utils/parse-script-data';

export default {
    getPlayInfo: async (ctx, shareId, ksong_mid = '') => {
        const link = `https://node.kg.qq.com/play?s=${shareId}`;
        const cache_key = ksong_mid ? `ksong:${ksong_mid}` : link;
        const data = await cache.tryGet(cache_key, async () => {
            const response = await got(link);
            const $ = load(response.data);
            const script = $('script')
                .toArray()
                .map((element) => $(element).text())
                .filter((source) => source.includes('__DATA__'))
                .join('\n');
            const data = parseScriptData<{
                detail: {
                    song_name: string;
                    content: string;
                    nick: string;
                    cover: string;
                    playurl: string;
                    ksong_mid: string;
                    ctime: number;
                    comments: Array<{ nick: string; content: string; ctime: number; comment_id: string }>;
                };
            }>(script, 'window.__DATA__');
            const name = data.detail.song_name;
            const description = data.detail.content;
            const author = data.detail.nick;
            const itunes_item_image = data.detail.cover;

            const enclosure_url = data.detail.playurl;
            ksong_mid ??= data.detail.ksong_mid;
            const ctime = data.detail.ctime;
            const comments = data.detail.comments;

            return { name, link, description, author, enclosure_url, ksong_mid, ctime, itunes_item_image, comments };
        });
        return data;
    },
};
