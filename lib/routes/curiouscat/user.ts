// @ts-nocheck
import got from '@/utils/got';

const fetchAPIByUser = async (user) => {
    const baseURL = 'https://curiouscat.me/api/v2/profile?username=';
    const { data } = await got.get(baseURL + user);
    return data;
};

export default async (ctx) => {
    const id = ctx.req.param('id');
    const user = id;
    const data = await fetchAPIByUser(user);
    const items = data.posts.map((post) => {
        const author = post.senderData.id ? post.senderData.username : 'Anonymous';
        const title = `@${author}: ${post.comment}`;
        const link = `https://curiouscat.live/${user}/post/${post.id}`;
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

    ctx.set('data', {
        title: `CuriousCat - ${user}`,
        link: `https://curiouscat.live/${user}`,
        description: `Questions answered by ${user} using CuriousCat`,
        language: data.lang,
        item: items,
    });
};
