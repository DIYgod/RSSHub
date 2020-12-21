const got = require('@/utils/got');

const config = {
    global: '要闻',
    'a-stock': 'A股',
    'us-stock': '美股',
    'hk-stock': '港股',
    forex: '外汇',
    commodity: '商品',
    financing: '理财',
};

module.exports = async (ctx) => {
    ctx.params.channel = ctx.params.channel || 'global';

    const currentUrl = `https://wallstreetcn.com/live/${ctx.params.channel}`;
    const rootUrl = `https://api.wallstcn.com/apiv1/content/lives?channel=${ctx.params.channel}-channel`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = response.data.data.items.map((item) => {
        let title;
        const match = item.content_text.match(/【(.*)】/);
        if (match !== null) {
            title = match[1];
        } else {
            title = item.content_text;
        }
        return {
            title,
            link: `https://wallstreetcn.com/livenews/${item.id}`,
            pubDate: new Date(item.display_time * 1000).toUTCString(),
            description: item.content,
        };
    });

    ctx.state.data = {
        title: `${config[ctx.params.channel]} - 实时快讯 - 华尔街见闻`,
        link: currentUrl,
        item: items,
    };
};
