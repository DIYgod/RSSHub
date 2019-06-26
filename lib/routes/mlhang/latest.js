const got = require('@/utils/got');
const api_url = 'https://www.mlhang.com/search/contents?start=0&count=10';
const host = 'https://www.mlhang.com';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: api_url,
    });
    const data = response.data.data.docs;

    ctx.state.data = {
        title: '马良行|建筑行业知识分享平台',
        link: host,
        description: '马良行文章更新提醒',
        item: data.map((item) => ({
            title: item['title.0.name'],
            description: item.detail,
            pubDate: new Date(item.updateTime * 1),
            link: host + item.resurl,
        })),
    };
};
