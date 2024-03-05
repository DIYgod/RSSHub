// @ts-nocheck
import cache from '@/utils/cache';
import { config } from '@/config';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const utils = require('./utils');
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();
import { queryToBoolean } from '@/utils/readable-social';

export default async (ctx) => {
    const kw = ctx.req.param('kw');
    const order = ctx.req.param('order') || 'pubdate';
    const disableEmbed = queryToBoolean(ctx.req.param('disableEmbed'));
    const kw_url = encodeURIComponent(kw);
    const tids = ctx.req.param('tid') ?? 0;

    const data = await cache.tryGet(
        `bilibili:vsearch:${tids}:${kw}:${order}`,
        async () => {
            await got('https://passport.bilibili.com/login', {
                cookieJar,
            });

            const response = await got('https://api.bilibili.com/x/web-interface/search/type', {
                headers: {
                    Referer: `https://search.bilibili.com/all?keyword=${kw_url}`,
                },
                cookieJar,
                searchParams: {
                    search_type: 'video',
                    highlight: 1,
                    keyword: kw,
                    order,
                    tids,
                },
            });
            return response.data.data.result;
        },
        config.cache.routeExpire,
        false
    );

    ctx.set('data', {
        title: `${kw} - bilibili`,
        link: `https://search.bilibili.com/all?keyword=${kw}&order=${order}`,
        description: `Result from ${kw} bilibili search, ordered by ${order}.`,
        item: data.map((item) => {
            const l = item.duration
                .split(':')
                .map((i) => [i.length > 1 ? i : ('00' + i).slice(-2)])
                .join(':');
            const des = item.description.replaceAll('\n', '<br/>');
            const img = item.pic.replaceAll(/^\/\//g, 'http://');
            return {
                title: item.title.replaceAll(/<[ /]?em[^>]*>/g, ''),
                author: item.author,
                category: [...item.tag.split(','), item.typename],
                description:
                    `Length: ${l}<br/>` +
                    `AuthorID: ${item.mid}<br/>` +
                    `Play: ${item.play}    Favorite: ${item.favorites}<br/>` +
                    `Danmaku: ${item.video_review}    Comment: ${item.review}<br/>` +
                    `<br/>${des}<br/>` +
                    `<img src="${img}"><br/>` +
                    `Match By: ${item.hit_columns.join(',')}` +
                    (disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`),
                pubDate: parseDate(item.pubdate, 'X'),
                guid: item.arcurl,
                link: item.arcurl,
            };
        }),
    });
};
