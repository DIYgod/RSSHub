import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { getIpLocations } from '../ip-location';

export const route: Route = {
    path: '/topic/:id/:sort?',
    categories: ['social-media'],
    example: '/douban/topic/48823',
    parameters: { id: '话题id', sort: '排序方式，hot或new，默认为new' },
    features: {
        requireConfig: [{ name: 'DOUBAN_COOKIE', optional: true, description: '仅登录可见的话题或IP属地详情需要本人豆瓣 Cookie。' }],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '话题',
    maintainers: ['LogicJake', 'pseudoyu', 'haowenwu'],
    description: '源详情页明确显示的作者 IP 属地和首屏回帖 IP 属地分别放入 IP 属地：… 和 回帖 IP 属地：… 分类，可使用通用过滤参数。不以作者个人资料所在地替代 IP。需要登录才能查看的内容请配置 DOUBAN\\_COOKIE。',
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
            Cookie: config.douban.cookie,
        },
    });

    const data = response.data?.items;
    if (!Array.isArray(data) || !data.length) {
        throw new TypeError('The Douban topic API returned no accessible items. Verify the topic ID and DOUBAN_COOKIE.');
    }

    let title = id;
    let description = '';

    if (data[0].topic) {
        title = data[0].topic.name;
        description = data[0].topic.introduction;
    }

    const out = await pMap(
        data,
        async (item) => {
            const type = item.target.type;
            let author;
            let date;
            let description;
            let link;
            let title;
            if (type === 'status') {
                link = item.target.status.url || item.target.status.sharing_url.split('&', 1)[0];
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
                link = item.target.url || item.target.sharing_url;
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
                link = item.target.url || item.target.sharing_url;
                author = item.target.author.name;
                title = author + '的日记';
                date = item.target.create_time;

                const id = item.target.id;
                const itemUrl = `https://www.douban.com/j/note/${id}/full`;

                description = await cache.tryGet(`douban:note:${id}:${md5(config.douban.cookie || 'visitor')}`, async () => {
                    const response = await got.get(itemUrl, { headers: { Cookie: config.douban.cookie } });
                    return response.data.html;
                });
            }
            const single = {
                title,
                link,
                author,
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
                description,
            };

            return single;
        },
        { concurrency: 3 }
    );
    const items = await pMap(out, async (item) => ({ ...item, category: await getIpLocations(item.link) }), { concurrency: 3 });

    return {
        title: `${title}-豆瓣话题`,
        description,
        link,
        item: items,
    };
}
