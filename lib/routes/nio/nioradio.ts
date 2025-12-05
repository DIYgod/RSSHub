import { URLSearchParams } from 'node:url';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/nioradio/:albumid',
    categories: ['multimedia'],
    description: `
::: tip
**如何获取电台 ID？**
打开蔚来 APP 后，点击“此地”→“NIO Radio”，找到自己想要转换为播客的专辑，分享后在生成的链接中找到\`container_id=\`后方的数字即可。
常见电台 ID：
| 电台名称          | 电台 ID |
| :------------ | :---- |
| 资讯充电站（早间版）    | 5     |
| 资讯充电站（晚间版）    | 23    |
| E 次元财经报       | 148   |
| 塞萌不塞车         | 661   |
| 乐行记           | 11    |
| Weekend Dance | 547   |
:::`,
    example: '/nio/nioradio/5',
    parameters: { albumid: '电台专辑 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: 'NIO Radio',
    maintainers: ['marcosteam'],
    handler: async (ctx) => {
        const { albumid } = ctx.req.param();
        const req = new URLSearchParams({
            albumId: albumid,
            sorttype: '2',
            pagenum: '1',
            pagesize: '10',
        }).toString();
        const data = await ofetch('https://gateway-front-external.nio.com/moat/100914/v2/audio/list', {
            method: 'POST',
            body: req,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const podcasts = data.result.dataList;
        const podcastName = podcasts[0].albumName;
        const podcastImage = podcasts[0].albumPic;

        const items = podcasts.map((podcast) => ({
            title: podcast.audioName,
            link: `https://app.nio.com/app/radio/share/?item_type=1&item_id=${String(podcast.audioId).slice(1)}&container_id=${albumid}`,
            pubDate: parseDate(podcast.onlineTime),
            description: podcast.albumDesc,
            author: podcast.host.join(', '),
            itunes_item_image: podcast.albumPic,
            itunes_duration: podcast.duration / 1000,
            enclosure_url: podcast.aacPlayUrl192,
            enclosure_length: podcast.aacFileSize192,
            enclosure_type: 'audio/x-m4a',
        }));
        return {
            title: `NIO Radio - ${podcastName}`,
            link: 'https://www.nio.com',
            itunes_author: podcasts[0].host.join(', '),
            image: podcastImage,
            item: items,
        };
    },
};
