const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.liwushuo.com';
    const link = `${baseUrl}/api/channels/1/items`;
    const res = await got(link, {
        searchParams: {
            limit: 21,
        },
    });

    const item = res.data.data.items.map((item) => {
        const { content_url, cover_image_url, created_at, share_msg, title } = item;
        return {
            title,
            link: content_url,
            pubDate: new Date(created_at * 1000).toUTCString(),
            description: [`<img src="${cover_image_url}"/>`, share_msg].join('<br/>'),
        };
    });

    ctx.state.data = {
        title: '礼物说 - 精选',
        description: '礼物说 - 精选',
        link: baseUrl,
        item,
    };
};
