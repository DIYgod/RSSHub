const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://bandcamp.com';
    const apiUrl = `${rootUrl}/api/bcweekly/3/list`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}/?show=${item.id}`,
        pubDate: Date.parse(item.published_date),
        description: `<img src="https://f4.bcbits.com/img/00${item.v2_image_id}_0"><p>${item.desc}</p>`,
    }));

    ctx.state.data = {
        title: 'Bandcamp Weekly',
        link: rootUrl,
        item: items,
    };
};
