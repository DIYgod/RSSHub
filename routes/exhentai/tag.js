const axios = require('../../utils/axios');
const c = require('cheerio');
const {
    exhentai: { cookie },
} = require('../../config');
module.exports = async (ctx) => {
    const { input = '', only } = ctx.params;
    const querystr = input ? '?' + input.replace(' ', '+') + '&f_' : '?f_' + JSON.parse(only).join('=1&f_') + '=1&f_apply=Apply+Filter';
    let data = await ctx.cache.get(querystr);
    try {
        data = JSON.parse(data);
    } catch (e) {
        data = '';
    }
    if (!data) {
        data = [];
        const res = await axios.get('https://exhentai.org/' + querystr, {
            headers: {
                Cookie: cookie,
            },
        });
        const $ = c.load(res.data);
        $('.it5 > a').each((i, e) => {
            data.push({
                title: $(e).text(),
                description: $(e).text(),
                pubDate: Date.parse(
                    $(e)
                        .parent()
                        .parent()
                        .parent()
                        .parent()
                        .find('[style="white-space:nowrap"]')
                        .text()
                ),
                guid: $(e).attr('href'),
                link: $(e).attr('href'),
            });
        });
        ctx.cache.set(querystr, JSON.stringify(data), 60 * 10);
    }
    ctx.state.data = {
        title: 'ExHentai',
        link: 'https://exhentai.org',
        description: 'EXXXXXXX',
        item: data,
    };
};
