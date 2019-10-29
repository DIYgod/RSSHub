const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://36kr.com/api/newsflash?per_page=30`,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });

    const newsflashes = response.data.data.items;

    let newsflashesList = [];
    for (let i = 0; i < newsflashes.length; i++) {
        newsflashesList = newsflashesList.concat(newsflashes[i]);
    }

    const out = newsflashesList.map((item) => {
        const date = item.published_at;
        const link = item.news_url;
        const title = item.title;
        const description = item.description;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `快讯 - 36氪`,
        link: `https://36kr.com/newsflashes`,
        item: out,
    };
};
