const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.hellobtc.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${rootUrl}/topic/${id}.html`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('div.content > h1').text();
    const list = $('div.tab_pane')
        .find('div.new_item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
        }))
        .filter((item) => item)
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('#nr').html();
                item.pubDate = timezone(parseDate(content('span.date').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `白话区块链 - ${title}专栏`,
        link: url,
        item: items,
    };
};
