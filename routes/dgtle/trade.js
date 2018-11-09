const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let { typeId = '' } = ctx.params;
    if (typeId === 0) {
        typeId = '';
    }

    const host = 'http://trade.dgtle.com';
    const baseUrl = `${host}/dgtle_module.php?mod=trade&typeid=${typeId}`;
    const res = await axios({
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
                    const tradeDetail = await axios({
                        method: 'get',
                        url: url,
                    });
                    const $ = cheerio.load(tradeDetail.data);
                    const pubDate = new Date(
                        $('.cr_date > em')
                            .last()
                            .text()
                    ).toUTCString();
                    let description = `<img referrerpolicy="no-referrer" src="${$tradeItem
                        .find('.cover')
                        .attr('src')
                        .replace(/\?.+/g, '')}" /><br>`;

                    description += $tradeItem.find('.tradeprice').text();
                    description += $('#trade_info').html();
                    description += $('.pcb').html();

                    item.description = description;
                    item.pubDate = pubDate;
                    ctx.cache.set(
                        key,
                        {
                            pubDate,
                            description,
                        },
                        24 * 60 * 60
                    );
                }

                return Promise.resolve(item);
            })
            .get()
    );

    ctx.state.data = {
        title: '甩甩尾巴',
        description: '纯净，安全的玩家闲置物品交易平台',
        link: baseUrl,
        item: resultItem,
    };
};
