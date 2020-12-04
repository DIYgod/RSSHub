const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'latest';
    const options = {
        latest: {
            title: '最新',
            url: `https://server.matters.news/graphql?operationName=NewestFeedPublic&variables=%7B%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22e92b760b24751d2fd2f1664e5bfe3d26518fc6e59fe81678de88e1aa3c37bcdc%22%7D%7D`,
        },
        heat: {
            title: '熱議',
            url: `https://server.matters.news/graphql?operationName=TopicsFeedPublic&variables=%7B%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2292b779fe8f47f0c9ed8b0876c905b4ca2dd75b8cd733f1984294cd3893b50949%22%7D%7D`,
        },
        essence: {
            title: '精華',
            url: `https://server.matters.news/graphql?operationName=IcymiFeedPublic&variables=%7B%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22c2175d06bc033da1598acfb99100ebae2eed52a913f9f7c862b675e7688bdee1%22%7D%7D`,
        },
    };

    const response = await got({
        method: 'get',
        url: options[type].url,
        headers: {
            referer: `https://matters.news/`,
        },
    });

    const item = await Promise.all(
        response.data.data.viewer.recommendation.feed.edges.map(async ({ node }) => {
            const link = `https://matters.news/@${node.author.userName}/${encodeURIComponent(node.slug)}-${node.mediaHash}`;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(link);
            const $ = cheerio.load(res.data);
            const article = $('.u-content').html();
            const single = {
                title: node.title,
                link,
                description: article,
                author: node.author.userName,
                pubDate: node.createdAt,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `Matters | ${options[type].title}`,
        link: 'https://matters.news/',
        item,
    };
};
