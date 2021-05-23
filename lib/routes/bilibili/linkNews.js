const got = require('@/utils/got');

module.exports = async (ctx) => {
    const product = ctx.params.product;

    let productTitle = '';

    switch (product) {
        case 'live':
            productTitle = '直播';
            break;
        case 'vc':
            productTitle = '小视频';
            break;
        case 'wh':
            productTitle = '相簿';
            break;
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/news/v1/notice/list?platform=pc&product=${product}&category=all&page_no=1&page_size=20`,
        headers: {
            Referer: 'https://link.bilibili.com/p/eden/news',
        },
    });
    const data = response.data.data.items;

    ctx.state.data = {
        title: `bilibili ${productTitle}公告`,
        link: `https://link.bilibili.com/p/eden/news#/?tab=${product}&tag=all&page_no=1`,
        description: `bilibili ${productTitle}公告`,
        item:
            data &&
            data.map((item) => ({
                title: item.title,
                description: `${item.mark}<br><img src="${item.cover_url}">`,
                pubDate: new Date(item.ctime.replace(' ', 'T') + '+08:00').toUTCString(),
                link: item.announce_link ? item.announce_link : `https://link.bilibili.com/p/eden/news#/newsdetail?id=${item.id}`,
            })),
    };
};
