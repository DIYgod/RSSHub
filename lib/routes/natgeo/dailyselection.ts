import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

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

    let sort = 0;
    let addtime = '';

    for (let i = 0; i < data.data.album.length; i++) {
        if (Number.parseInt(data.data.album[i].ds) === 1) {
            sort = data.data.album[i].sort;
            addtime = data.data.album[i].addtime;
            break;
        }
    }
    const api = 'http://dili.bdatu.com/jiekou/albums/a' + sort + '.html';
    const response = await got(api);
    const items = response.data.picture;
    const out = [];

    items.map((item) => {
        const info = {
            title: item.title,
            link: item.url,
            description: `<img src="${item.url}"><br>` + item.content,
            pubDate: timezone(parseDate(addtime), +0),
            guid: item.id,
        };
        out.push(info);
        return info;
    });

    return {
        title: 'Photo of the Daily Selection',
        link: api,
        item: out,
    };
}
