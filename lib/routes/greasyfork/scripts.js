const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const language = ctx.params.language === 'all' ? 'zh-CN' : ctx.params.language;
    const domain = ctx.params.domain;
    const filter_locale = ctx.params.language === 'all' ? 0 : 1;
    const url = domain ? `by-site/${domain}` : '';

    const res = await axios({
        method: 'get',
        url: `https://greasyfork.org/${language}/scripts/${url}`,
        params: {
            filter_locale: filter_locale,
            sort: 'updated',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.script-list').find('h2');

    ctx.state.data = {
        title: $('title')
            .first()
            .text(),
        link: `https://greasyfork.org/${language}/scripts/${url}`,
        description: $('meta[name=description]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: item.find('.description').text(),
                        link: `https://greasyfork.org${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};
