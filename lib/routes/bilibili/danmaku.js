const cheerio = require('cheerio');
const cache = require('./cache');
const fetch = require('node-fetch');

module.exports = async (ctx) => {
    const aid = ctx.params.aid;
    const pid = Number(ctx.params.pid || 1);
    const limit = 50;
    const cid = await cache.getCidFromAid(ctx, aid, pid);

    const videoName = await cache.getVideoNameFromAid(ctx, aid);

    const danmakuResponse = await fetch(`https://comment.bilibili.com/${cid}.xml`);
    const danmakuText = await danmakuResponse.text();
    let danmakuList = [];
    const $ = cheerio.load(danmakuText, { xmlMode: true });
    $('d').each((index, item) => {
        danmakuList.push({ p: $(item).attr('p'), text: $(item).text() });
    });

    danmakuList = danmakuList.reverse().slice(0, limit);

    ctx.state.data = {
        title: `${videoName} 的 弹幕动态`,
        link: `https://www.bilibili.com/video/av${aid}`,
        description: `${videoName} 的 弹幕动态`,
        item: danmakuList.map((item) => ({
            title: item.text,
            description: item.text,
            pubDate: new Date(item.p.split(',')[4] * 1000).toUTCString(),
            guid: `${cid}-${item.p.split(',')[4]}-${item.p.split(',')[7]}`,
            link: `https://www.bilibili.com/video/av${aid}`,
        })),
    };
};
