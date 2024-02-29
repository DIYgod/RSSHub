const got = require('@/utils/got');

module.exports = async (ctx) => {
    const crxid = ctx.params.crxid;

    const page_url = `https://microsoftedge.microsoft.com/addons/detail/${crxid}`;

    const { data } = await got({
        method: 'get',
        url: `https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/${crxid}?hl=zh-CN&gl=CN`,
        headers: {
            Referer: page_url,
        },
    });

    ctx.state.data = {
        title: `${data.name} - Microsoft Edge Addons`,
        description: data.shortDescription,
        image: `https:${data.thumbnail}`,
        link: page_url,
        item: [
            {
                title: 'v' + data.version,
                author: data.developer,
                description: data.description,
                pubDate: new Date(data.lastUpdateDate * 1000),
                guid: `edge::${crxid}::${data.version}`,
                link: page_url,
            },
        ],
    };
};
