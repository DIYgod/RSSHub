const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://idaily-cdn.idailycdn.com/api/list/v3/iphone/zh-hans?page=1&ver=iphone',
    });

    const data = response.data;

    let dataToday = data.filter((item) => item.pubdate_timestamp * 1000 >= new Date().getTime() - 86400000);

    // leverage yesterday's items if today's not published yet
    if (dataToday.length === 0) {
        dataToday = data.filter((item) => item.pubdate_timestamp * 1000 >= new Date().getTime() - 86400000 * 2);
    }

    ctx.state.data = {
        title: `iDaily 每日环球视野`,
        description: 'iDaily 每日环球视野',
        item: dataToday.map((item) => ({
            title: item.ui_sets.caption_subtitle,
            description: `<img src='${item.cover_landscape}'><br>${item.content}`,
            pubDate: new Date(item.pubdate_timestamp * 1000).toUTCString(),
            link: item.link_share,
        })),
    };
};
