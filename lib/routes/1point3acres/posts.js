const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { posts } = (await axios.get(`https://instant.1point3acres.com/v2/api/user/post?pg=1&ps=10&user_id=${id}`)).data;
    const [{ author_name: author }] = posts;

    ctx.state.data = {
        title: `${author}的回复 - 一亩三分地`,
        link: `https://instant.1point3acres.com/profile/${id}`,
        description: `${author}的回复 - 一亩三分地`,
        item: posts.map((item) => ({
            title: item.message,
            author,
            description: item.message,
            pubDate: new Date(item.create_time + ' GMT+8').toUTCString(),
            link: `https://instant.1point3acres.com/thread/${item.thread_id}/post/${item.id}`,
        })),
    };
};
