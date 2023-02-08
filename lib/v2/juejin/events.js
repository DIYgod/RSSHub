const got = require('@/utils/got');

module.exports = async (ctx) => {
    const city = ctx.params.city === 'all' ? '' : ctx.params.city;
    let cityName = ''

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/event_api/v1/event/event_list',
        json: {
            city: city === 'all' ? '' : city,
            count: 20,
            cursor: 0
        },
    });

    const items = response.data.data.map((item) => {
        const content = item.title;
        const title = content;
        const guid = item.id;
        const link = item.url;
        const imgs = `<img src="${item.screenshot}">`;
        const description = `
            ${content.replace(/\n/g, '<br>')}<br>
            ${imgs}<br>
        `;

        cityName = city ? item.city : '全部'

        return {
            title,
            link,
            description,
            guid
        };
    });

    ctx.state.data = {
        title: `开发者活动 ${cityName}`,
        link: `https://juejin.cn/events/${encodeURIComponent(city)}`,
        description: `开发者活动 ${cityName}`,
        item: items,
    };
};