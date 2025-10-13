const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language === 'all' ? 'zh-CN' : ctx.params.language || 'zh-CN';
    const domain = ctx.params.domain;
    const filter_locale = ctx.params.language === 'all' ? 0 : 1;
    const sort = ctx.params.sort ? ctx.params.sort : 'updated';
    const url = domain ? `/by-site/${domain}` : '';
    const currentUrl = `https://greasyfork.org/${language}/scripts${url}`;
    const res = await got({
        method: 'get',
        url: currentUrl,
        searchParams: {
            filter_locale,
            sort,
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.script-list').find('article');

    ctx.state.data = {
        title: $('title').first().text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: list?.toArray().map((item) => {
            item = $(item);
            const h2 = item.find('h2');
            return {
                title: h2.find('a').text(),
                description: h2.find('.description').text(),
                link: new URL(h2.find('a').attr('href'), 'https://greasyfork.org').href,
                pubDate: parseDate(item.find('.script-list-created-date relative-time').attr('datetime')),
                updated: parseDate(item.find('.script-list-updated-date relative-time').attr('datetime')),
                author: item
                    .find('.script-list-author a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join(', '),
            };
        }),
    };
};
