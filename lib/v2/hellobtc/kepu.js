const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.hellobtc.com';

const channelSelector = {
    latest: 'div.index_tabs_container.js-tabs-container > div:nth-child(1)',
    bitcoin: 'div.index_tabs_container.js-tabs-container > div:nth-child(2)',
    ethereum: 'div.index_tabs_container.js-tabs-container > div:nth-child(3)',
    defi: 'div.index_tabs_container.js-tabs-container > div:nth-child(4)',
    inter_blockchain: 'div.index_tabs_container.js-tabs-container > div:nth-child(5)',
    mining: 'div.index_tabs_container.js-tabs-container > div:nth-child(6)',
    safety: 'div.index_tabs_container.js-tabs-container > div:nth-child(7)',
    satoshi_nakamoto: 'div.index_tabs_container.js-tabs-container > div:nth-child(8)',
    public_blockchain: 'div.index_tabs_container.js-tabs-container > div:nth-child(9)',
};

const titleMap = {
    latest: '最新',
    bitcoin: '比特币',
    ethereum: '以太坊',
    defi: 'DeFi',
    inter_blockchain: '跨链',
    mining: '挖矿',
    safety: '安全',
    satoshi_nakamoto: '中本聪',
    public_blockchain: '公链',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'latest';
    const url = `${rootUrl}/kepu.html`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $(channelSelector[channel])
        .find('div.new_item')
        .map((_, item) => ({
            title: $(item).find('a').text(),
            link: $(item).find('a').attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('#js_content')
                    .html()
                    .replace(/(<img.*?)data-src(.*?>)/g, '$1src$2');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `白话区块链 - 科普 ${titleMap[channel]}`,
        link: url,
        item: items,
    };
};
