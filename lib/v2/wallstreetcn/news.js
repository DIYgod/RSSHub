const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    global: '最新',
    shares: '股市',
    bonds: '债市',
    commodities: '商品',
    forex: '外汇',
    enterprise: '公司',
    'asset-manage': '资管',
    tmt: '科技',
    estate: '地产',
    car: '汽车',
    medicine: '医药',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'global';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/live/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/information-flow?channel=${category}-channel&accept=article&limit=25`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.items.map((item) => ({
        link: item.resource.uri,
        title: item.resource?.title,
        author: item.resource.author?.display_name,
        pubDate: parseDate(item.resource.display_time * 1000),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.rich-text, .live-detail-html').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[category]} - 资讯 - 华尔街见闻`,
        link: currentUrl,
        item: items,
    };
};
