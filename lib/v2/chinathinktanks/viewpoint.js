const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { CookieJar } = require('tough-cookie');

const cookieJar = new CookieJar();
const baseUrl = 'https://www.chinathinktanks.org.cn';

module.exports = async (ctx) => {
    const link = `https://www.chinathinktanks.org.cn/content/list?id=${ctx.params.id}&pt=1`;

    const response = await got(link, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);

    let items = $('.main-content-left-list-item')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('.title span').text(),
                link: baseUrl + e.attr('href'),
                author: e.find('.author-by span').text(),
                pubDate: e.find('.author-time').text(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    cookieJar,
                });
                const $ = cheerio.load(response.data);
                const content = $('#art');
                item.description = content.html();
                item.pubDate = item.pubDate.includes('-') ? timezone(parseDate(item.pubDate, 'YYYY-MM-DD'), +8) : parseRelativeDate(item.pubDate);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `中国智库网 —— ${$('title').text().split('_中国智库网')[0]}`,
        link,
        item: items,
    };
};
