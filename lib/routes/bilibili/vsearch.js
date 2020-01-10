const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const kw = ctx.params.kw;
    const order = ctx.params.order || 'pubdate';
    const disableEmbed = ctx.params.disableEmbed;
    const kw_url = encodeURIComponent(kw);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/search/type?jsonp=jsonp&search_type=video&highlight=1&keyword=${kw_url}&order=${order}&duration=0&single_column=0&tids=0`,
        headers: {
            Referer: `https://search.bilibili.com/all?keyword=${kw_url}`,
        },
    });
    const data = response.data.data.result;

    ctx.state.data = {
        title: `${kw} - bilibili`,
        link: `https://search.bilibili.com/all?keyword=${kw_url}&order=${order}`,
        description: `Result from ${kw} bilibili search, ordered by ${order}.`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => {
            const l = item.duration
                .split(':')
                .map((i) => [i.length > 1 ? i : ('00' + i).slice(-2)])
                .join(':');
            const des = item.description.replace(/\n/g, '<br/>');
            const img = item.pic.replace(/^\/\//g, 'http://');
            return {
                title: `${item.title.replace(/<[/ ]?em[^>]*>/g, '')}`,
                author: `${item.author}`,
                category: `${item.typename}`,
                description:
                    `Length: ${l}<br/>` +
                    `Author: ${item.author}    (ID: ${item.mid})<br/>` +
                    `Play: ${item.play}    Favorite: ${item.favorites}<br/>` +
                    `Danmaku: ${item.video_review}    Comment: ${item.review}<br/>` +
                    `Category: ${item.typename}<br/>` +
                    `<br/>${des}<br/>` +
                    `<img src="${img}"><br/>` +
                    `Tag: ${item.tag}<br/>` +
                    `Match By: ${item.hit_columns.join(',')}` +
                    (!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''),
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                guid: `${item.arcurl}`,
                link: `${item.arcurl}`,
            };
        }),
    };
};
