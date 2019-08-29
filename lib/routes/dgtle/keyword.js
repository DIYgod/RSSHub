const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const host = 'http://trade.dgtle.com';
    const baseUrl = `${host}/dgtle_module.php?mod=trade&searchsort=1&PName=${keyword}`;
    const res = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(res.data);
    const tradeList = $('.tradebox');

    const resultItem = await Promise.all(
        tradeList
            .map(async (_, tradeItem) => {
                const $tradeItem = $(tradeItem);

                const url = `${host}${$tradeItem.find('.tradetitle a').attr('href')}`;
                const item = {
                    title: $tradeItem.find('.tradetitle').attr('title'),
                    description: '',
                    link: url,
                    author: $tradeItem.find('.tradeuser').text(),
                };

                const key = `dgtle-trade: ${url}`;
                const value = await ctx.cache.get(key);

                if (value) {
                    item.description = value.description;
                    item.pubDate = value.pubDate;
                } else {
                    const tradeDetail = await got({
                        method: 'get',
                        url: url,
                    });
                    const $ = cheerio.load(tradeDetail.data);
                    const pubDate = new Date(
                        $('.cr_date > em')
                            .last()
                            .text()
                    ).toUTCString();
                    let description = `<img src="${$tradeItem
                        .find('.cover')
                        .attr('src')
                        .replace(/\?.+/g, '')}" /><br>`;

                    description += $tradeItem.find('.tradeprice').text();
                    description += $('#trade_info').html();
                    description += $('.pcb').html();

                    item.description = description;
                    item.pubDate = pubDate;
                    ctx.cache.set(key, {
                        pubDate,
                        description,
                    });
                }

                return Promise.resolve(item);
            })
            .get()
    );

    ctx.state.data = {
        title: `甩甩尾巴 - ${keyword}`,
        description: '纯净，安全的玩家闲置物品交易平台',
        link: baseUrl,
        item: resultItem,
    };
};
