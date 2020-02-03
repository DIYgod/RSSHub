const cheerio = require('cheerio');
const got = require('@/utils/got');
const queryString = require('query-string');
const url = 'https://www.thegradcafe.com/survey/';
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const res = await got.get(url, {
        searchParams: queryString.stringify({
            q: type,
        }),
    });
    const $ = cheerio.load(res.data);
    const list = $('table.submission-table tbody tr');
    const out = list
        .slice(0, 10)
        .map(function() {
            const title = $(this)
                .find('.tcol1 ')
                .text();
            const author = $(this)
                .find('.tcol2')
                .text();
            const description =
                $(this)
                    .find($('strong').parents('.tcol3'))
                    .text() +
                ' Note:' +
                $(this)
                    .find('.tcol6')
                    .text();
            const pubDate = $(this)
                .find('.tcol5')
                .text();
            const item = {
                title,
                author,
                description,
                pubDate,
                // note
            };
            return item;
        })
        .get();

    ctx.state.data = {
        title: 'gradCafe',
        link: url,
        item: out,
    };
};
