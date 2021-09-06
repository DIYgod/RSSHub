const got = require('@/utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword ? ctx.params.keyword : '';

    let default_order, default_time;
    if (keyword) {
        default_order = 'mr';
        default_time = 'a';
    } else {
        default_order = 'mv';
        default_time = 'm';
    }

    const order = ctx.params.order ? ctx.params.order : default_order;
    const time = ctx.params.time ? ctx.params.time : default_time;
    const top = ctx.params.top ? ctx.params.top : 30;
    const url = keyword ? `https://api.avgle.com/v1/search/${keyword}/0` : `https://api.avgle.com/v1/videos/0`;

    const response = await got({
        method: 'get',
        url,
        searchParams: {
            o: order,
            t: time,
            limit: top,
        },
    });
    const returnData = response.data.response.videos;

    const compact_number = (number) => `${Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(number)}`;
    const like = (item) => `[${Math.round((item.likes / (item.likes + item.dislikes)) * 100)}%/${compact_number(item.likes + item.dislikes)}/${compact_number(item.viewnumber)}]`;

    ctx.state.data = {
        title: `Avgle ${order}/${time}`,
        link: keyword ? `https://avgle.com/search/videos/${keyword}?o=${order}&t=${time}` : `https://avgle.com/videos?o=${order}&t=${time}`,
        description: `Avgle ${order}/${time}`,
        item: returnData.map((item) => ({
            title: like(item) + item.title,
            description: `${item.preview_video_url ? `<video controls loop ${item.preview_url ? `poster="${item.preview_url}"` : ''} src="${item.preview_video_url}" />` : ''}`,
            pubDate: new Date(item.addtime * 1000).toUTCString(),
            link: item.video_url,
            category: item.keyword.split(' '),
        })),
    };
};
