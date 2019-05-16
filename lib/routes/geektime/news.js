const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const column_id = '120';

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

    // Get latest news(top 20)
    const news_response = await axios({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/audios',
        headers: {
            Referer: 'https://time.geekbang.org/',
            'Content-Type': 'application/json',
        },
        data: {
            cid: column_id,
        },
    });

    const news = news_response.data.data.list;

    ctx.state.data = {
        title: intro_data.column_title,
        link: `https://time.geekbang.org/column/intro/${column_id}`,
        description: intro_data.column_subtitle,
        item: news.map((item) => ({
            title: item.article_title,
            description: item.article_summary,
            pubDate: new Date(item.article_ctime * 1000).toUTCString(),
            link: `https://time.geekbang.org/column/article/${item.id}`,
        })),
    };
};
