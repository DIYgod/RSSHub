import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/topic/:id/:sort?',
    categories: ['social-media'],
    example: '/douban/topic/48823',
    parameters: { id: '话题id', sort: '排序方式，hot或new，默认为new' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '话题',
    maintainers: ['LogicJake', 'pseudoyu', 'haowenwu'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const sort = ctx.req.param('sort') || 'new';

    const link = `https://www.douban.com/gallery/topic/${id}/?sort=${sort}`;

    const api = `https://m.douban.com/rexxar/api/v2/gallery/topic/${id}/items?sort=${sort}&start=0&count=10&status_full_text=1`;
    const response = await got({
        method: 'GET',
        url: api,
        headers: {
            Referer: link,
        },
    });

    const data = response.data.items;

    let title = id;
    let description = '';

    if (data[0].topic !== null) {
        title = data[0].topic.name;
        description = data[0].topic.introduction;
    }

    const out = await Promise.all(
        data.map(async (item) => {
            const type = item.target.type;
            let author;
            let date;
            let description;
            let link;
            let title;
            if (type === 'status') {
                link = item.target.status.sharing_url.split('&')[0];
                author = item.target.status.author.name;
                title = author + '的广播';
                date = item.target.status.create_time;
                description = item.target.status.text;
                const images = item.target.status.images;
                if (images) {
                    let i;
                    for (i in images) {
                        description += `<br><img src="${images[i].normal.url}" />`;
                    }
                }
            } else if (type === 'topic') {
                link = item.target.sharing_url;
                author = item.target.author.name;
                title = item.target.title;
                date = item.target.create_time;
                description = item.target.abstract;
                const images = item.target.photos;
                if (images) {
                    let i;
                    for (i in images) {
                        description += `<br><img src="${images[i].src}" />`;
                    }
                }
            } else {
                link = item.target.sharing_url;
                author = item.target.author.name;
                title = author + '的日记';
                date = item.target.create_time;

                const id = item.target.id;
                const itemUrl = `https://www.douban.com/j/note/${id}/full`;

                const cacheIn = await cache.get(link);
                if (cacheIn) {
                    return JSON.parse(cacheIn);
                }
                const response = await got.get(itemUrl);
                description = response.data.html;
            }
            const single = {
                title,
                link,
                author,
                pubDate: new Date(date).toUTCString(),
                description,
            };

            if (type !== 'status') {
                cache.set(link, JSON.stringify(single));
            }
            return single;
        })
    );

    return {
        title: `${title}-豆瓣话题`,
        description,
        link,
        item: out,
    };
}
