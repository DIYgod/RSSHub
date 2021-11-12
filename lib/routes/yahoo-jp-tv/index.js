const got = require('@/utils/got');
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = async (ctx) => {
    const query = querystring.stringify({ q: ctx.params.query });
    const link = `https://tv.yahoo.co.jp/search/?${query}`;
    const response = await got(link);
    const $ = cheerio.load(response.body);
    const [title] = $('.search_result').find('p').text().split('：');
    const item = $('.programlist li')
        .map((index, item) => {
            const $item = $(item);
            const title = `${$item.find('.leftarea').text().replace(/\n/g, '')} ${$item.find('.yjLS').text()}`;
            const link = `https://tv.yahoo.co.jp${$item.find('div.rightarea p.yjLS.pb5p a').attr('href')}`;
            const description = $item.find('p.yjMS:nth-child(3)').text();
            return { title, description, link };
        })
        .get();
    ctx.state.data = { title, link, item };
};
