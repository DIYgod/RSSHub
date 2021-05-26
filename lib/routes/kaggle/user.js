const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.kaggle.com/${ctx.params.user}/discussion_messages.json?sortBy=latestPost&group=commentsAndTopics&page=1&pageSize=20&sortby=latestPost&pagesize=20`,
    });

    ctx.state.data = {
        title: `${ctx.params.user}'s discussion - Kaggle`,
        link: `https://www.kaggle.com/${ctx.params.user}/discussion?sortBy=mostVotes&group=commentsAndTopics&page=1&pageSize=20`,
        item: response.data.discussions.map((item) => ({
            title: item.forum.name,
            link: `https://www.kaggle.com${item.forum.url}`,
            description: item.message,
            pubDate: new Date(item.postDate).toUTCString(),
        })),
    };
};
