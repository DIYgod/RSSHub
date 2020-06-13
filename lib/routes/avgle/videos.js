const got = require('@/utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword ? ctx.params.keyword : '';
    const order = ctx.params.order ? ctx.params.order : 'mv';
    const time = ctx.params.time ? ctx.params.time : 'm';

    const response = await got({
        method: 'get',
        url: keyword ? `https://api.avgle.com/v1/search/${keyword}/0` : `https://api.avgle.com/v1/videos/0`,
        searchParams: {
            o: order,
            t: time,
            limit: 250,
        },
    });
    const data = response.data.response.videos;

    const compact_number = (number) => `${Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(number)}`;
    const like = (item) => `[${Math.round((item.likes / (item.likes + item.dislikes)) * 100)}%/${compact_number(item.likes + item.dislikes)}/${compact_number(item.viewnumber)}]`;

    ctx.state.data = {
        title: `Avgle`,
        link: `https://avgle.com/videos?o=${order}&t=${time}`,
        description: `Avgle`,
        item: data.map((item) => ({
            title: like(item) + item.title,
            description: `${item.preview_video_url ? `<video controls loop ${item.preview_url ? `poster="${item.preview_url}"` : ''} src="${item.preview_video_url}" />` : ''}`,
            pubDate: new Date(item.addtime * 1000).toUTCString(),
            link: item.video_url,
            category: item.keyword.split(' '),
        })),
    };
};
