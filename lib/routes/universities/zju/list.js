const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.zju.edu.cn/';
module.exports = async (ctx) => {
    const type = ctx.params.type || 'xs';
    const link = host + type + `/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);

    function sortDate(e) {
        // console.log(e);
        const pubday = e.substr(-3, 2);
        const pubmonth = e.substr(-6, 2);
        const pubyear = e.substr(-11, 4);
        const pubdateString = pubmonth + `-` + pubday + `-` + pubyear;
        // console.log(pubdateString);

        return pubdateString;
    }
    function sortUrl(e) {
        if (e.search('redirect') !== -1) {
            return link;
        } else {
            return e;
        }
    }
    const list = $('#wp_news_w7 ul.news li')
        .map(function() {
            const info = {
                title: $(this)
                    .find('a')
                    .text(),
                link: sortUrl(
                    $(this)
                        .find('a')
                        .attr('href')
                ),
                date: sortDate($(this).text()),
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
                headers: {
                    Referer: link,
                },
            });
            const $ = cheerio.load(response.data);
            const description = $('.right_content').html();
            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toLocaleDateString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `浙江大学` + $('ul.submenu .selected').text(),
        link: link,
        item: out,
    };
};
