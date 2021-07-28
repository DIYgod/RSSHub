const got = require('@/utils/got');
const url = require('url');

const rootUrl = 'https://www.kaggle.com/';

const sortCodes = {
    hot: 'Hotness',
    recent: 'Recent Comments',
    new: 'Recently Posted',
    top: 'Most Votes',
    active: 'Most Comments',
};

module.exports = async (ctx) => {
    const sort = ctx.params.sort || 'hot';
    const forumId = ctx.params.forumId;
    const sortText = sortCodes[sort];

    const response = await got({
        method: 'get',
        url:
            forumId !== 'all'
                ? `https://www.kaggle.com/forums/${forumId}/topics.json?sortBy=${sort}&group=all&page=1&pageSize=20&category=all`
                : `https://www.kaggle.com/topics.json?sortBy=${sort}&group=all&page=1&pageSize=20&category=all`,
        headers: {
            Referer: rootUrl,
        },
    });

    const topics = response.data.topics;
    let name;
    const out = await Promise.all(
        topics.map(async (item) => {
            const title = item.title;
            const id = item.id;
            const author = item.userAvatar.displayName;
            const topicUrl = url.resolve(rootUrl, item.topicUrl.split('#')[0]);
            name = item.topicUrl.split('/')[2];

            const apiUrl = `https://www.kaggle.com/topics/${id}.json`;
            const cache = await ctx.cache.get(apiUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: apiUrl,
                headers: {
                    Referer: topicUrl,
                },
            });
            const content = response.data.comment.content;

            const single = {
                link: topicUrl,
                title: title,
                author: author,
                description: content,
            };

            ctx.cache.set(apiUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${name} Topic-${sortText}`,
        link: url.resolve(rootUrl, `c/${name}/discussion`),
        item: out,
    };
};
