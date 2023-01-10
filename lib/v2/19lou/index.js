const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const iconv = require('iconv-lite');
const { isValidHost } = require('@/utils/valid-host');

const setCookie = function (cookieName, cookieValue, seconds, path, domain, secure) {
    let expires = null;
    if (seconds !== -1) {
        expires = new Date();
        expires.setTime(expires.getTime() + seconds);
    }
    return [encodeURI(cookieName), '=', encodeURI(cookieValue), expires ? '; expires=' + expires.toGMTString() : '', path ? '; path=' + path : '/', domain ? '; domain=' + domain : '', secure ? '; secure' : ''].join('');
};

module.exports = async (ctx) => {
    const city = ctx.params.city ?? 'www';
    if (!isValidHost(city)) {
        throw Error('Invalid city');
    }

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
                        cookie: setCookie('_Z3nY0d4C_', '37XgPK9h', 365, '/', '19lou.com'),
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
