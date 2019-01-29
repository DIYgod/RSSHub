const convert = require('xml-js');
const cache = require('./cache');
const fetch = require('node-fetch');

module.exports = async (ctx) => {
    const aid = ctx.params.aid;
    const pid = Number(ctx.params.pid || 1);
    const limit = ctx.query.limit || 50;
    const cid = await cache.getCidFromAid(ctx, aid, pid);

    const videoName = await cache.getVideoNameFromAid(ctx, aid);

    const danmakuResponse = await fetch(`https://comment.bilibili.com/${cid}.xml`);
    const danmakuText = await danmakuResponse.text();

    const danmakuJs = convert.xml2js(danmakuText, { compact: true });

    const danmaku = danmakuJs.i.d.reverse().slice(0, limit);
    ctx.state.data = {
        title: `${videoName} 的 弹幕动态`,
        link: `https://www.bilibili.com/video/av${aid}`,
        description: `${videoName} 的 弹幕动态`,
        item: danmaku.map((item) => ({
            title: item._text,
            description: item._text,
            pubDate: new Date(item._attributes.p.split(',')[4] * 1000).toUTCString(),
            guid: `${cid}-${item._attributes.p.split(',')[4]}-${item._attributes.p.split(',')[7]}`,
            link: `https://www.bilibili.com/video/av${aid}`,
        })),
    };
};
