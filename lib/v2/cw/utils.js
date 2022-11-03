const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { Cookie, CookieJar } = require('tough-cookie');
let cookieJar;
const config = require('@/config').value;

const baseUrl = 'https://www.cw.com.tw';

const got = require('@/utils/got').extend({
    headers: {
        'User-Agent': config.trueUA,
    },
});

const getCookie = async () => {
    const response = await got(`${baseUrl}/user/get/cookie-bar`);
    const cookies = response.headers['set-cookie'];
    if (Array.isArray(cookies)) {
        cookieJar = cookies.map(Cookie.parse);
    } else {
        cookieJar = [Cookie.parse(cookieJar)];
    }
    cookieJar = CookieJar.fromJSON({ cookies: cookieJar });
};

const parseList = ($, limit) =>
    $('.caption')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: item.find('h3 a').attr('href'),
                pubDate: parseDate(item.find('time').text()),
            };
        })
        .slice(0, limit);

const parseItems = (list, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    cookieJar,
                });

                const $ = cheerio.load(response);
                const meta = JSON.parse($('head script[type="application/ld+json"]').eq(0).text());
                $('.article__head .breadcrumb, .article__head h1, .article__provideViews, .ad').remove();
                $('img.lazyload').each((_, img) => {
                    if (img.attribs['data-src']) {
                        img.attribs.src = img.attribs['data-src'];
                        delete img.attribs['data-src'];
                    }
                });

                item.title = $('head title').text();
                item.category = $('meta[name=keywords]').attr('content').split(',');
                item.pubDate = parseDate(meta.datePublished);
                item.author = meta.author.name.replace(',', ' ') || meta.publisher.name;
                item.description = $('.article__head .container').html() + $('.article__content').html();

                return item;
            })
        )
    );

module.exports = {
    baseUrl,
    cookieJar,
    got,
    getCookie,
    parseList,
    parseItems,
};
