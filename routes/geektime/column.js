const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const column_id = ctx.params.cid;

    // Get column introduction including column name and description
    const intro_response = await axios({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/intro',
        headers: {
            Referer: 'https://time.geekbang.org/',
            'Content-Type': 'application/json',
        },
        data: {
            cid: column_id,
        },
    });

    const intro_data = intro_response.data.data;

    // Get latest articles
    const latest_response = await axios({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/articles/latest',
        headers: {
            Referer: 'https://time.geekbang.org/',
            'Content-Type': 'application/json',
        },
        data: {
            cid: column_id,
        },
    });

    const articles = latest_response.data.data.list;

    ctx.state.data = {
        title: intro_data.column_title,
        link: `https://time.geekbang.org/column/intro/${column_id}`,
        description: intro_data.column_subtitle,
        item: articles.map((item) => ({
            title: item.article_title,
            description: item.article_summary,
            pubDate: new Date(item.article_ctime * 1000).toUTCString(),
            link: `https://time.geekbang.org/column/article/${item.id}`,
        })),
    };
};
