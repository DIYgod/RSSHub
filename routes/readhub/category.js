const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    let title;
    switch (category) {
        case 'topic':
            title = '热门话题';
            break;
        case 'news':
            title = '科技动态';
            break;
        case 'technews':
            title = '开发者资讯';
            break;
        case 'blockchain':
            title = '区块链快讯';
            break;
        default:
            break;
    }

    const response = await axios({
        method: 'get',
        url: `https://api.readhub.me/${category}`,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: `Readhub-${title}`,
        link: 'https://readhub.me',
        item: data.data.map((item) => ({
            title: item.title,
            pubDate: new Date(item.publishDate).toUTCString(),
            description: item.summary,
            guid: item.id,
            link: item.url || item.newsArray[0].url,
        })),
    };
};
