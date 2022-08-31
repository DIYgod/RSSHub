const got = require('@/utils/got');
const cheerio = require('cheerio');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const language = ctx.params.language === 'all' ? 'zh-CN' : ctx.params.language;
    const domain = ctx.params.domain;
    const filter_locale = ctx.params.language === 'all' ? 0 : 1;
    const url = domain ? `by-site/${domain}` : '';
    const currentUrl = `https://greasyfork.org/${language}/scripts/${url}`;
    const res = await got({
        method: 'get',
        url: currentUrl,
        searchParams: queryString.stringify({
            filter_locale,
            sort: 'updated',
        }),
    });
    const $ = cheerio.load(res.data);
    const list = $('.script-list').find('h2');

    ctx.state.data = {
        title: $('title').first().text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: item.find('.description').text(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
