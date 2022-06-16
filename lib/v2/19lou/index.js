const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const iconv = require('iconv-lite');

function SetCookie(b, h) {
    const c = new Date();
    const g = SetCookie.arguments;
    const e = SetCookie.arguments.length;
    const d = e > 2 ? g[2] : null;
    const i = e > 3 ? g[3] : null;
    const f = e > 4 ? g[4] : null;
    const a = e > 5 ? g[5] : false;
    if (d !== null && d >= 0) {
        c.setTime(c.getTime() + d * 24 * 60 * 60 * 1000);
    }
    return b + '=' + encodeURI(h) + (d === null || d < 0 ? (d === -1 ? '; expires=-1' : '') : '; expires=' + c.toGMTString()) + (i === null ? '' : '; path=' + i) + (f === null ? '' : '; domain=' + f) + (a === true ? '; secure' : '');
}

module.exports = async (ctx) => {
    const city = ctx.params.city ?? 'www';

    const rootUrl = `https://${city}.19lou.com`;

    const response = await got({
        method: 'get',
        url: rootUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    $('.title-more').remove();

    let items = $('.center-center-jiazi')
        .find('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: `https:${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                    headers: {
                        cookie: SetCookie('_Z3nY0d4C_', '37XgPK9h', 365, '/', '19lou.com'),
                        referer: rootUrl,
                    },
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                content('.name-lz, .postView-pk-mod').remove();

                item.author = content('.uname, .user-name').first().text();
                item.description = content('.post-cont').first().html() || content('.thread-cont').html();
                item.pubDate = timezone(parseDate(content('.cont-top-left meta').first().attr('content')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text().split('-')[0],
        link: rootUrl,
        item: items,
    };
};
