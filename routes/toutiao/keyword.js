const axios = require('axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const response = await axios({
        method: 'get',
        url: `https://www.toutiao.com/search_content/?offset=0&format=json&keyword=${encodeURIComponent(keyword)}&autoload=true&count=20&cur_tab=1&from=search_tab`,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `${keyword}`,
        link: `https://www.toutiao.com/search/?keyword=${keyword}`,
        description: `${keyword}`,
        item: data.map((item) => ({
                title: `${item.media_name}: ${item.title}`,
                description: `${item.abstract}`,
                link: `${item.article_url}`,
            })),
    };
};
