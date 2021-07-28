const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.egsea.com/news/flash-list?per-page=30`,
        headers: {
            Referer: `https://www..com/news/flash`,
        },
    });

    const newsflashes = response.data.data;

    let newsflashesList = [];
    for (let i = 0; i < newsflashes.length; i++) {
        newsflashesList = newsflashesList.concat(newsflashes[i]);
    }

    const out = newsflashesList.map((item) => {
        const pubDate = item.pageTime;
        const link = 'https://www.egsea.com' + item.url;
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
        title: `快讯 - e 公司`,
        link: `https://www.egsea.com/news/flash`,
        item: out,
    };
};
