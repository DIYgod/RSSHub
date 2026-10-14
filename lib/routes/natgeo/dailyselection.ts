import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dailyselection',
    name: 'Daily Selection',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/natgeo/dailyselection',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
    },
    radar: [
        {
            source: ['nationalgeographic.com/'],
        },
    ],
    maintainers: ['OrangeEd1t'],
    handler,
};

async function handler() {
    const host = 'http://dili.bdatu.com/jiekou/mains/p1.html';
    const data = await got(host);

    const album = data.data.album.find((album) => Number(album.ds) === 1) ?? data.data.album.find((album) => Number(album.timing) === 1);
    if (!album || !/^[1-9]\d*$/.test(String(album.id))) {
        throw new Error('The source did not provide a current daily photo album. Please try again when a new album is published.');
    }
    const { id: albumId, addtime } = album;
    const api = `http://dili.bdatu.com/jiekou/albums/a${albumId}.html`;
    const response = await got(api);
    const items = response.data.picture;
    const out: any[] = [];

    items.map((item) => {
        const info = {
            title: item.title,
            link: item.url,
            description: `<img src="${item.url}"><br>` + item.content,
            pubDate: addtime ? timezone(parseDate(addtime), 8) : undefined,
            guid: item.id,
        };
        out.push(info);
        return info;
    });

    return {
        title: 'Photo of the Daily Selection',
        link: 'http://dili.bdatu.com/',
        item: out,
    };
}
