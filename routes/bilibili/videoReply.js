const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const avid = ctx.params.avid;

    const nameResponse = await axios({
        method: 'get',
        url: `https://www.bilibili.com/video/av${avid}`,
        headers: {
            'User-Agent': config.ua,
        },
        responseType: 'arraybuffer'
    });
    const responseHtml = iconv.decode(nameResponse.data, 'UTF-8');
    const $ = cheerio.load(responseHtml);
    let name = $("title").text();
    name = name.substr(0, name.indexOf("_哔哩哔哩"));

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/reply?type=1&oid=${avid}&sort=0`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://www.bilibili.com/video/av${avid}`,
        }
    });

    const data = response.data.data.replies;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${name} 的 评论`,
        link: `https://www.bilibili.com/video/av${avid}`,
        description: `${name} 的 评论`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: `${item.member.uname} : ${item.content.message}`,
            description: `#${item.floor}<br> ${item.member.uname} : ${item.content.message}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: `https://www.bilibili.com/video/av${avid}/#reply${item.rpid}`
        })),
    });
};