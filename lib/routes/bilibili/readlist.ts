// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
