const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `https://api.xiaoheihe.cn/maxnews/app/list?tag=-1&offset=0&limit=30&rec_mark=timeline&heybox_id=12777814&imei=867252032615972&os_type=Android&os_version=9&version=1.1.55&_time=1551801017&hkey=b28cd7a1cba463b4d9176ba2f8f42d35`,
    });
    const data = response.data.result;

    ctx.state.data = {
        title: `小黑盒游戏新闻`,
        link: `https://xiaoheihe.cn/community/index`,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: item.date,
            link: item.newUrl,
        })),
    };
};
