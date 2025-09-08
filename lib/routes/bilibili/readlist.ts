import { Route, ViewType } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/readlist/:listid',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/bilibili/readlist/25611',
    parameters: { listid: '文集 id, 可在专栏文集 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '专栏文集',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const listid = ctx.req.param('listid');
    const listurl = `https://www.bilibili.com/read/readlist/rl${listid}`;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/article/list/web/articles?id=${listid}&jsonp=jsonp`,
        headers: {
            Referer: listurl,
        },
    });
    const data = response.data.data;

    return {
        title: `bilibili 专栏文集 - ${data.list.name}`,
        link: listurl,
        image: data.list.image_url,
        description: data.list.summary ?? '作者很懒，还木有写简介.....((/- -)/',
        item:
            data.articles &&
            data.articles.map((item) => ({
                title: item.title,
                author: data.author.name,
                description: `${item.summary}…<br><img src="${item.image_urls[0]}">`,
                pubDate: new Date(item.publish_time * 1000).toUTCString(),
                link: `https://www.bilibili.com/read/cv${item.id}/?from=readlist`,
            })),
    };
}
