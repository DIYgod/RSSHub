const cheerio = require('cheerio');
const cache = require('./cache');
const got = require('@/utils/got');
const zlib = require('zlib');

module.exports = async (ctx) => {
    let bvid = ctx.params.bvid;
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const pid = Number(ctx.params.pid || 1);
    const limit = 50;
    const cid = await cache.getCidFromId(ctx, aid, pid, bvid);

    const videoName = await cache.getVideoNameFromId(ctx, aid, bvid);

    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const danmakuResponse = await got.get(`https://comment.bilibili.com/${cid}.xml`, {
        decompress: false,
        responseType: 'buffer',
        headers: {
            Referer: link,
        },
    });

    let danmakuText = danmakuResponse.body;

    if ((danmakuText[0] & 0x0f) === 0x08) {
        danmakuText = await zlib.inflateSync(danmakuText);
    } else {
        danmakuText = await zlib.inflateRawSync(danmakuText);
    }

    let danmakuList = [];
    const $ = cheerio.load(danmakuText, { xmlMode: true });
    $('d').each((index, item) => {
        danmakuList.push({ p: $(item).attr('p'), text: $(item).text() });
    });

    danmakuList = danmakuList.reverse().slice(0, limit);

    ctx.state.data = {
        title: `${videoName} 的 弹幕动态`,
        link: link,
        description: `${videoName} 的 弹幕动态`,
        item: danmakuList.map((item) => ({
            title: item.text,
            description: item.text,
            pubDate: new Date(item.p.split(',')[4] * 1000).toUTCString(),
            guid: `${cid}-${item.p.split(',')[4]}-${item.p.split(',')[7]}`,
            link: link,
        })),
    };
};
