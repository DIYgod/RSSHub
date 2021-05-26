const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'https://asia.playstation.com/';
module.exports = async (ctx) => {
    const link = `https://asia.playstation.com/chs-hk/ps4/system-update/ps4-system-update-change-log/`;
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const $ = cheerio.load(response.data);
    // let title = $('.psc-main-format-style').first().text();
    function sortDate(e) {
        // console.log(e);
        const pubday = e.substr(8, 2);
        const pubmonth = e.substr(5, 2);
        const pubyear = e.substr(0, 4);
        const pubdateString = pubmonth + `-` + pubday + `-` + pubyear;
        // console.log(pubdateString);
        return pubdateString;
    }
    const list = $('.layoutRowParsys ul li')
        .map(function () {
            const info = {
                title: $(this).find('span.psc-d-block').text(),
                link: $(this).find('a').attr('href'),
                date: sortDate($(this).find('span.psc-info-date').text()),
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
            const response = await got.get(itemUrl, {
                responseType: 'buffer',
            });
            const $ = cheerio.load(response.data);
            const description = $('.layoutRowParsys').html();
            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toDateString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('.psc-main-format-style').first().text(),
        link: link,
        item: out,
    };
};
