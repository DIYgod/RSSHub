const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    global: '要闻',
    'a-stock': 'A股',
    'us-stock': '美股',
    'hk-stock': '港股',
    forex: '外汇',
    commodity: '商品',
    financing: '理财',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'global';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/live/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/lives?channel=${category}-channel&limit=${ctx.query.limit ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.items.map((item) => {
        let author;
        try {
            author = item.author.display_name;
        } catch (e) {
            author = '';
        }

        return {
            link: item.uri,
            title: item.title || item.content_text,
            description: item.content,
            pubDate: parseDate(item.display_time * 1000),
            author,
        };
    });

    ctx.state.data = {
        title: `${titles[category]} - 实时快讯 - 华尔街见闻`,
        link: currentUrl,
        item: items,
    };
};
