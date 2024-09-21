import { Route } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import { load } from 'cheerio';
import got from '@/utils/got';
import { config } from '@/config';
export const route: Route = {
    path: '/people/:userid/wish/:routeParams?',
    categories: ['social-media'],
    example: '/douban/people/exherb/wish',
    parameters: { userid: '用户id', routeParams: '额外参数；见下' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户想看',
    maintainers: ['exherb'],
    handler,
    description: `对于豆瓣用户想看的内容，在 \`routeParams\` 参数中以 query string 格式设置如下选项可以控制输出的样式

  | 键         | 含义       | 接受的值 | 默认值 |
  | ---------- | ---------- | -------- | ------ |
  | pagesCount | 查询页面数 |          | 1      |`,
};

async function handler(ctx) {
    const userid = ctx.req.param('userid');
    const routeParams = querystring.parse(ctx.req.param('routeParams'));

    let userName;

    const pageSize = 15;
    const pagesCount = routeParams.pagesCount ? Number.parseInt(routeParams.pagesCount) : 1;
    const tasks = [];
    for (let page = 0; page < pagesCount; page += 1) {
        const url = `https://movie.douban.com/people/${userid}/wish?start=${page * pageSize}`;

        tasks.push(
            cache
                .tryGet(
                    url,
                    async () => {
                        const _r = await got({
                            method: 'GET',
                            url,
                            headers: {
                                Referer: url,
                                Cookie: config.douban.cookie || '',
                            },
                        });
                        return _r.data;
                    },
                    config.cache.routeExpire,
                    false
                )
                .then((data) => {
                    const $ = load(data);
                    const list = $('div.article > div.grid-view > div.item');
                    userName = userName || $('div.side-info-txt > h3').text();

                    if (list) {
                        return Promise.all(
                            list.get().map((item) => {
                                item = $(item);
                                const itemPicUrl = item.find('.pic a img').attr('src');
                                const info = item.find('.info');
                                const title = info.find('ul li.title a').text();
                                const url = info.find('ul li.title a').attr('href');
                                const title_ = title.split('/').find((title) => title.trim());
                                const day = info.find('ul li .date').text().trim();
                                const rssItem = {
                                    title: title_,
                                    description: `${info.find('.intro').text()}<br><img src="${itemPicUrl}">`,
                                    link: url,
                                    pubDate: new Date(day),
                                };

                                return rssItem;
                            })
                        );
                    }
                })
        );
    }

    const items = (await Promise.all(tasks)).flat();
    return {
        title: `豆瓣想看 - ${userName || userid}`,
        link: `https://movie.douban.com/people/${userid}/wish`,
        item: items,
    };
}
