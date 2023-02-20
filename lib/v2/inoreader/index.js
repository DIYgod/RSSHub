const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = 'html';
    const user = ctx.params.user;
    const tag = ctx.params.tag;
    const num = ctx.query.limit || 20;
    const rootUrl = 'https://www.inoreader.com/stream';
    const currentUrl = `${rootUrl}/user/${user}/tag/${tag}/view/${type}?n=${num}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const entries = $('#snip_body>.article_content');

    ctx.state.data = {
        title: $('.header_text').text().trim(),
        link: currentUrl,
        item: entries
            .map((idx, item) => {
                const content = $(item).clone();
                const header = $(item).prev();
                let pubDate = $('div.article_author span', header).text().match('((posted at)|(posted on [A-Z][a-z]*)) [0-9 :]+UTC([+-]1?[0-9])?')[0];
                pubDate = pubDate.replace('posted on', '');
                const today = new Date().toUTCString().slice(0, -12);
                pubDate = pubDate.replace('posted at', today);
                return {
                    title: $('a.title_link', header).text().trim(),
                    link: $('a.title_link', header).attr('href'),
                    author: $('div.article_author span span', header).text().trim() + ' via ' + $('div.article_author a.feed_link', header).text().trim(),
                    pubDate: parseDate(pubDate),
                    description: $(content).html(),
                };
            })
            .get(),
        allowEmpty: true,
    };
    ctx.state.json = ctx.state.data;
};
