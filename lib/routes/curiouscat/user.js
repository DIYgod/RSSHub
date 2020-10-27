const got = require('@/utils/got');

const fetchAPIByUser = async (user) => {
    const baseURL = 'https://curiouscat.me/api/v2/profile?username=';
    const { data } = await got.get(baseURL + user);
    return data;
};

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const user = id;
    const data = await fetchAPIByUser(user);
    const items = data.posts.map((post) => {
        const author = post.senderData.id ? post.senderData.username : 'Anonymous';
        const title = `@${author}: ${post.comment}`;
        const link = `https://curiouscat.qa/${user}/post/${post.id}`;
        const media = post.media ? `<img src="${post.media.img}"></img>` : '';
        const description = `${post.comment}<br><br>
        ${post.reply}
        ${media}
        <br>
        Likes: ${post.likes}`;
        const pubDate = new Date(post.timestamp * 1000);
        return {
            author,
            link,
            title,
            description,
            pubDate,
        };
    });

    ctx.state.data = {
        title: `Curiouscat - ${user}`,
        link: `https://curiouscat.qa/${user}`,
        description: `Questions answered by ${user} using Curiouscat`,
        language: data.lang,
        item: items,
    };
};
