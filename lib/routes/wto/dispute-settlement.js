const got = require('@/utils/got');

module.exports = async (ctx) => {
    ctx.params.year = ctx.params.year || new Date().getFullYear();

    const rootUrl = 'https://www.wto.org';
    const currentUrl = `${rootUrl}/library/news/news_${ctx.params.year}_e.js`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data.split('] = {');

    data.shift();

    const items = data.map((item) => {
        item = '{' + item.split('news_item[')[0].replace('};', '}');
        return {
            title: item.match(/ni_head:"(.*)",/)[1],
            link: item.match(/nl_url:"(.*)",/)[1],
            description: item.match(/ni_intro:"(.*)",/)[1],
            pubDate: new Date(
                item
                    .match(/ni_date:"(.*)",/)[1]
                    .replace(/\./g, '-')
                    .replace('_', ' ')
            ).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `Dispute settlement news archive ${ctx.params.year} - WTO`,
        link: currentUrl,
        item: items,
    };
};
