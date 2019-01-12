const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    let title;
    let path = category;
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
        case 'daily':
            title = '每日早报';
            break;
        default:
            break;
    }

    if (path === 'daily') {
        path = 'topic/daily';
    }

    const response = await axios({
        method: 'get',
        url: `https://api.readhub.cn/${path}`,
    });

    const data = response.data;

    ctx.state.data = {
        title: `Readhub-${title}`,
        link: 'https://readhub.cn',
        item: data.data.map((item) => ({
            title: item.title,
            pubDate: new Date(item.publishDate || Date.now()).toUTCString(),
            description: item.summary || item.title,
            guid: `/${category}/${item.id}`,
            link: category === 'daily' ? `https://readhub.cn/topic/${item.id}` : item.url || item.newsArray[0].url,
        })),
    };
};
