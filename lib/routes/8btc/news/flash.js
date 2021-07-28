const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://app.blockmeta.com/w1/news/list?num=30&cat_id=4481&page=1`,
        headers: {
            from: 'web',
            Referer: `https://www.8btc.com/flash`,
        },
    });

    const newsflashes = response.data.list;

    let newsflashesList = [];
    for (let i = 0; i < newsflashes.length; i++) {
        newsflashesList = newsflashesList.concat(newsflashes[i]);
    }

    const out = newsflashesList.map((item) => {
        const pubDate = item.post_date_format;
        const link = item.source.link;
        const title = item.title;
        const description = item.content;

        const single = {
            title,
            link,
            pubDate,
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `快讯 - 巴比特`,
        link: `https://www.8btc.com/flash`,
        item: out,
    };
};
