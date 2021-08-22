const got = require('../../utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const response = await got({
        method: 'get',
        url: `https://www.toutiao.com/api/search/content/?offset=0&format=json&keyword=${encodeURIComponent(keyword)}&autoload=true&count=20&cur_tab=1&from=search_tab`,
        headers: {
            Referer: `https://www.toutiao.com/search/?keyword=${encodeURIComponent(keyword)}`,
        },
    });
    let data = response.data.data;
    data = data.filter((item) => !item.cell_type);

    ctx.state.data = {
        title: `今日头条: ${keyword}`,
        link: `https://www.toutiao.com/search/?keyword=${keyword}`,
        description: `${keyword}`,
        item: data.map((item) => ({
            title: `${item.media_name}: ${item.title}`,
            description: `${item.abstract}`,
            pubDate: `${new Date(parseInt(item.create_time) * 1000)}`,
            link: `${item.article_url}`,
        })),
    };
};
