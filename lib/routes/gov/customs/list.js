const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.customs.gov.cn/';
module.exports = async (ctx) => {
    const gchannel = ctx.params.gchannel;
    let channelName = ``;
    let link = `http://www.customs.gov.cn/customs/302249/2476857/302309/index.html`;

    switch (gchannel) {
        case 'paimai':
            channelName = '拍卖信息';
            link = `http://www.customs.gov.cn/customs/302249/302309/index.html`;

            break;
        case 'fagui':
            channelName = '海关法规';
            link = `http://www.customs.gov.cn/customs/302249/302266/index.html`;
            break;
        default:
            break;
    }
    const response = await got({
        method: 'get',
        url: link,
        header: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('[class^="conList_ul"] li')
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
                date: $(this).find('span').text(),
            };
            return info;
        })
        .get();
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: itemUrl,
                header: {
                    Referer: host,
                },
            });
            const $ = cheerio.load(response.data);
            $('.easysite-news-operation').remove();
            const description = $('.easysite-news-peruse').html();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date).toDateString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `中国海关-${channelName}`,
        link,
        item: out,
    };
};
