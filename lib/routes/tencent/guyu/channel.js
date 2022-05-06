const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const map = new Map([
    ['lab', { title: '谷雨实验室', link: 'https://news.qq.com/guyu/huizong/hz_lab.htm', channelid: 498 }],
    ['report', { title: '谷雨报道', link: 'https://news.qq.com/guyu/huizong/hz_report.htm', channelid: 500 }],
    ['story', { title: '谷雨故事', link: 'https://gy.qq.com/hz_story.html', channelid: 332 }],
    ['shalong', { title: '谷雨沙龙', link: 'https://news.qq.com/guyu/huizong/hz_shalong.htm', channelid: 542 }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.name;
    const title = map.get(type).title;
    const channelid = map.get(type).channelid;
    const link = map.get(type).link;

    const api = `https://i.match.qq.com/ninjayc/guyu?action=guyu&channelid=${channelid}&p=0&num=10`;
    const response = await got({
        method: 'get',
        url: api,
        headers: { Referer: link },
    });
    const list = response.data.data;

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.n_short_title;
            const date = info.n_publishtime;
            const itemUrl = info.n_url;
            const author = info.name;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl, {
                responseType: 'buffer',
            });

            response.data = iconv.decode(response.data, 'gbk');

            const $ = cheerio.load(response.data);
            const description = $('div.articleContent').html().replace(/src="/g, `src="https:`);

            const single = {
                title,
                link: itemUrl,
                description,
                author,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
