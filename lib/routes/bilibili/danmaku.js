const convert = require('xml-js');
const cache = require('./cache');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async (ctx) => {
    const aid = ctx.params.aid;
    const pid = Number(ctx.params.pid || 1);
    const limit = ctx.query.limit || 50;
    const cid = await cache.getCidFromAid(ctx, aid, pid);

    const videoName = await cache.getVideoNameFromAid(ctx, aid);

    const { stdout } = await exec(
        `curl 'https://comment.bilibili.com/${cid}.xml' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' -H 'DNT: 1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'Accept-Encoding: gzip, deflate, br'  --compressed`
    );

    if (stdout) {
        try {
            const danmakuJs = convert.xml2js(stdout, { compact: true });
            const danmaku = danmakuJs.i.d.reverse().slice(0, limit);
            ctx.state.data = {
                title: `${videoName} 的 弹幕动态`,
                link: `https://www.bilibili.com/video/av${aid}`,
                description: `${videoName} 的 弹幕动态`,
                item: danmaku.map((item) => ({
                    title: item._text,
                    description: item._text,
                    pubDate: new Date(item._attributes.p.split(',')[4] * 1000).toUTCString(),
                    link: `https://www.bilibili.com/video/av${aid}`,
                })),
            };
        } catch (e) {
            ctx.state.data = {};
        }
    } else {
        ctx.state.data = {};
    }
};
