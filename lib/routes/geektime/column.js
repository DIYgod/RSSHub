const got = require('@/utils/got');

module.exports = async (ctx) => {
    const column_id = ctx.params.cid;

    // Get column introduction including column name and description
    const intro_response = await got({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/intro',
        headers: {
            Referer: 'https://time.geekbang.org/',
        },
        json: {
            cid: column_id,
        },
    });

    const intro_data = intro_response.data.data;

    // Get latest articles
    const latest_response = await got({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/articles/latest',
        headers: {
            Referer: 'https://time.geekbang.org/',
        },
        json: {
            cid: column_id,
        },
    });

    const articles = latest_response.data.data.list;

    const out = articles.map((item) => {
        const title = item.article_title;
        const pubDate = new Date(item.article_ctime * 1000).toUTCString();
        const link = `https://time.geekbang.org/column/article/${item.id}`;
        const description = item.article_summary;

        return {
            title: title,
            pubDate: pubDate,
            link: link,
            description: description,
        };
    });

    out.reverse();
    ctx.state.data = {
        title: intro_data.column_title,
        link: `https://time.geekbang.org/column/intro/${column_id}`,
        description: intro_data.column_subtitle,
        item: out,
    };
};
