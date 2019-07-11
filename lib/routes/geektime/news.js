const got = require('@/utils/got');

module.exports = async (ctx) => {
    const column_id = '120';

    // Get column introduction including column name and description
    const intro_response = await got({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/intro',
        headers: {
            Referer: 'https://time.geekbang.org/',
        },
        json: true,
        data: {
            cid: column_id,
        },
    });

    const intro_data = intro_response.data.data;

    // Get latest news(top 20)
    const news_response = await got({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v1/column/audios',
        headers: {
            Referer: 'https://time.geekbang.org/',
        },
        json: true,
        data: {
            cid: column_id,
        },
    });

    const news = news_response.data.data.list;

    const out = await Promise.all(
        news.map(async (item) => {
            const title = item.article_title;
            const pubDate = new Date(item.article_ctime * 1000).toUTCString();
            const link = `https://time.geekbang.org/column/article/${item.id}`;
            const description = item.article_summary;

            const single = {
                title: title,
                pubDate: pubDate,
                link: link,
                description: description,
            };

            if (item.id !== undefined) {
                const value = ctx.cache.get(item.id);
                if (value) {
                    single.description = JSON.parse(value);
                } else {
                    try {
                        const article_response = await got({
                            method: 'post',
                            url: 'https://time.geekbang.org/serv/v1/article',
                            headers: {
                                Referer: link,
                            },
                            json: true,
                            data: {
                                id: item.id,
                                include_neighbors: true,
                            },
                        });

                        single.description = article_response.data.data.article_content;
                        ctx.cache.set(item.id, JSON.stringify(single.description));
                    } catch (err) {
                        single.description = description;
                    }
                }
            }
            return Promise.resolve(single);
        })
    );

    out.reverse();
    ctx.state.data = {
        title: intro_data.column_title,
        link: `https://time.geekbang.org/column/intro/${column_id}`,
        description: intro_data.column_subtitle,
        item: out,
    };
};
