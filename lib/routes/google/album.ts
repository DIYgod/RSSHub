import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/album/:id',
    categories: ['picture'],
    example: '/google/album/msFFnAzKmQmWj76EA',
    parameters: { id: 'album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Public Albums',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const url = `https://photos.app.goo.gl/${id}?_imcp=1`;

    const response = await ofetch.raw(url);

    const data = response._data?.match(/AF_initDataCallback\(\{key:\s*['"]ds:1['"],[\s\S]*?data:(\[[\s\S]*?\]),\s*sideChannel:/)?.[1];
    if (!data) {
        throw new Error('Unable to read this Google Photos album. Check that the album link is public and still available.');
    }

    const info = JSON.parse(data);
    const albumName = info[3][1];
    const ownerName = info[3][5][11][0];
    const list = info[1];

    const albumUrl = new URL(response.url);
    const authors = new Map<string, string>([info[3][5], ...info[3][9]].map((user) => [user[0], user[11][0]]));

    return {
        title: `${ownerName} 创建的 Google 相册 - ${albumName}`,
        link: url,
        item: list.slice(0, Math.max(50, getRouteLimit(ctx, 50))).map((item) => {
            const time = parseDate(item[2]);
            const imageUrl = `${item[1][0]}=w${item[1][1]}-h${item[1][2]}-no`;
            const videoUrl = item[9]?.['76647426']?.[13]?.[0];
            const description = videoUrl ? `<video src="${videoUrl}=m18" poster="${imageUrl}" controls controlslist="nodownload" loop style="max-width: 100%;"></video>` : `<img src="${imageUrl}" style="max-width: 100%;">`;
            const photoUrl = new URL(albumUrl);
            photoUrl.pathname += `/photo/${item[0]}`;
            return {
                title: time!.toLocaleString(),
                author: authors.get(item[6][0]),
                description,
                pubDate: time,
                link: photoUrl.href,
                guid: item[0],
            };
        }),
    };
}
