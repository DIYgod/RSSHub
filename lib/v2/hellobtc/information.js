const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.hellobtc.com';

const channelSelector = {
    latest: 'div.index_tabs_container.js-tabs-container > div:nth-child(1)',
    application: 'div.index_tabs_container.js-tabs-container > div:nth-child(2)',
};

const titleMap = {
    latest: '最新',
    application: '应用',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'latest';
    const url = rootUrl;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $(channelSelector[channel])
        .find('div.new_item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
        }))
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
        title: `白话区块链 - 首页 ${titleMap[channel]}`,
        link: url,
        item: items,
    };
};
