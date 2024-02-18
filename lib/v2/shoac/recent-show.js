const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.shoac.com.cn';

    const headers = {
        Channel: 'theatre_pc',
        Location: '121.458563,31.250315',
        Theater: 1323,
        'Flagship-Store': true,
    };

    const { data: products } = await got.post(`${baseUrl}/platform-backend/good/theater/dongyi-products`, {
        headers,
        json: {
            page: 1,
            size: 12,
            calendar: false,
            timeSort: true,
            venueId: '',
        },
    });

    const list = products.data.records.map((item) => ({
        title: item.productNameShort,
        category: [item.categoryName, item.subCategoryName],
        link: `${baseUrl}/#/detail?projectId=${item.projectId}`,
        projectId: item.projectId,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        placeCname: item.placeCname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detail } = await got(`${baseUrl}/platform-backend/good/project/detail/old/${item.projectId}`, {
                    headers,
                    searchParams: {
                        distributionSeriesId: '',
                        distributionChannelId: '',
                    },
                });
                const { data: show } = await got(`${baseUrl}/platform-backend/good/shows/old/${item.projectId}`, {
                    headers,
                    searchParams: {
                        distributionSeriesId: '',
                        distributionChannelId: '',
                    },
                });

                item.description = art(path.join(__dirname, 'templates/detail.art'), {
                    item,
                    detail: detail.data,
                    show: show.data,
                });
                item.pubDate = show.data.showInfoDetailList ? parseDate(show.data.showInfoDetailList[0].saleBeginTime, 'x') : null;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '演出月历 - 上海东方艺术中心管理有限公司',
        link: baseUrl,
        item: items,
    };
};
