const got = require('@/utils/got');
const cheerio = require('cheerio');
const rootUrl = 'https://www.coindesk.com';

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'consensus-magazine';

    const response = await got.get(`${rootUrl}/${channel}/`);
    const $ = cheerio.load(response.data);
    const content = JSON.parse(
        $('#fusion-metadata')
            .text()
            .match(/Fusion\.contentCache=(.*?);Fusion\.layout/)[1]
    );

    const o1 = content['websked-collections'];
    // Object key names are different every week
    const articles = o1[Object.keys(o1)[2]];

    const list = articles.data;

    const items = list.map((item) => ({
        title: item.headlines.basic,
        link: rootUrl + item.canonical_url,
        description: item.subheadlines.basic,
        pubDate: item.display_date,
    }));

    ctx.state.data = {
        title: 'CoinDesk Consensus Magazine',
        link: `${rootUrl}/${channel}`,
        item: items,
    };
};
