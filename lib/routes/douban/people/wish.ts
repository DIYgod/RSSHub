// @ts-nocheck
import cache from '@/utils/cache';
const querystring = require('querystring');
import { load } from 'cheerio';
import got from '@/utils/got';
import { config } from '@/config';
export default async (ctx) => {
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
    ctx.set('data', {
        title: `豆瓣想看 - ${userName || userid}`,
        link: `https://movie.douban.com/people/${userid}/wish`,
        item: items,
    });
};
