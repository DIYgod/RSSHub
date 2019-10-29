const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api-prod.wallstreetcn.com/apiv1/content/fabricate-articles?limit=30&channel=global',
    });

    const data = response.data;
    const stateData = {
        title: '华尔街见闻',
        link: 'https://wallstreetcn.com/news/global',
        description: '华尔街见闻-中国领先的商业和金融信息提供商，首创商业和金融信息“实时”模式，重要信息秒级推送。7*24小时全年不间断为用户提供资讯、数据、行情、研究和社区等服务。',
        item: [],
    };

    if (data.data && Array.isArray(data.data.items)) {
        data.data.items.forEach((item) => {
            if (item.resource_type !== 'article') {
                return;
            }
            stateData.item.push({
                title: item.resource.title,
                description: item.resource.content_short,
                pubDate: new Date(item.resource.display_time * 1000).toUTCString(),
                guid: item.resource.id,
                link: decodeURI(item.resource.uri),
                author: item.resource.author && item.resource.author.display_name,
            });
        });
    }
    ctx.state.data = stateData;
};
