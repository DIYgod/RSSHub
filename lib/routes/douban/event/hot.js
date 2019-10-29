const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { locationId = 0 } = ctx.params;
    const referer = 'https://m.douban.com/app_topic/event_hot';

    const response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/subject_collection/event_hot/items?os=ios&for_mobile=1&callback=&start=0&count=20&loc_id=${locationId}`,
        headers: {
            Referer: referer,
        },
    });

    ctx.state.data = {
        title: `豆瓣同城-热门活动-${locationId}`,
        link: referer,
        item: response.data.subject_collection_items.map(({ title, url, cover, subtype, info, price_range }) => {
            const description = `<img src="${cover.url}"><br>
              ${info}/${subtype}/${price_range}
            `;

            return {
                title,
                description,
                link: url,
            };
        }),
    };
};
