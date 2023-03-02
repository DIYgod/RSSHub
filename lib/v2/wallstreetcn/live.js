const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

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
    const score = ctx.params.score ?? 1;

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/live/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/lives?channel=${category}-channel&limit=${ctx.query.limit ?? 100}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.items
        .filter((item) => item.score >= score)
        .map((item) => ({
            link: item.uri,
            title: item.title || item.content_text,
            pubDate: parseDate(item.display_time * 1000),
            author: item.author?.display_name ?? '',
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.content,
                more: item.content_more,
                images: item.images,
            }),
        }));

    ctx.state.data = {
        title: `华尔街见闻 - 实时快讯 - ${titles[category]}`,
        link: currentUrl,
        item: items,
    };
};
