const config = require('@/config').value;
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const kw = ctx.params.kw;
    const order = ctx.params.order || 'pubdate';
    const disableEmbed = ctx.params.disableEmbed;
    const kw_url = encodeURIComponent(kw);
    const tids = ctx.params.tid ?? 0;

    const data = await ctx.cache.tryGet(
        `bilibili:vsearch:${tids}:${kw}:${order}`,
        async () => {
            await got('https://www.bilibili.com', {
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

    ctx.state.data = {
        title: `${kw} - bilibili`,
        link: `https://search.bilibili.com/all?keyword=${kw}&order=${order}`,
        description: `Result from ${kw} bilibili search, ordered by ${order}.`,
        item: data.map((item) => {
            const l = item.duration
                .split(':')
                .map((i) => [i.length > 1 ? i : ('00' + i).slice(-2)])
                .join(':');
            const des = item.description.replace(/\n/g, '<br/>');
            const img = item.pic.replace(/^\/\//g, 'http://');
            return {
                title: item.title.replace(/<[/ ]?em[^>]*>/g, ''),
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
                    (!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''),
                pubDate: parseDate(item.pubdate, 'X'),
                guid: item.arcurl,
                link: item.arcurl,
            };
        }),
    };
};
