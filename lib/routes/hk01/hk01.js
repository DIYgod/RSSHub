const got = require('@/utils/got');

module.exports = async (ctx) => {

    const response2 = await got({
        method: 'get',
        url: 'https://web-data.api.hk01.com/v2/feed/tag/1759?',
        headers: {
            Referer: 'https://www.hk01.com/tag/1759',
        },
    });

    const data2 = response2.data.items;
    ctx.state.data = {
        title:'影評｜香港01',
        link: 'https://www.hk01.com/tag/1759',
        description: '影評｜香港01',
        item: data2.map((item) => ({
            title: item.data.title,
            description: `${item.data.description}<br><img referrerpolicy="no-referrer" src="${item.data.mainImage.cdnUrl}">`,
            pubDate: new Date(item.data.publistTime * 1000).toUTCString(),
            link: item.data.publishUrl,
        })),
    };
};
