const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { threads } = (await got.get(`https://instant.1point3acres.com/v2/api/user/thread?pg=1&ps=10&user_id=${id}`)).data;
    const [{ author_name: author }] = threads;

    ctx.state.data = {
        title: `${author}的主题帖 - 一亩三分地`,
        link: `https://instant.1point3acres.com/profile/${id}`,
        description: `${author}的主题帖 - 一亩三分地`,
        item: threads.map((item) => ({
            title: item.title,
            author,
            description: item.description,
            pubDate: new Date(item.update_time + ' GMT+8').toUTCString(),
            link: `https://instant.1point3acres.com/thread/${item.id}`,
        })),
    };
};
