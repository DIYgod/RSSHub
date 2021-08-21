const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/bbs/web/profile/post/links?userid=${id}&limit=10&offset=0&version=999.0.0`,
    });
    const user_data = response.data.user;
    const post_data = response.data.post_links;
    const user_name = user_data.username;

    const out = await Promise.all(
        post_data.map(async (post) => {
            const title = post.description;
            const date = post.create_at;
            const itemUrl = `https://xiaoheihe.cn/community/7216/list/${post.linkid}`;

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('.post-content').html();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${user_name}的动态`,
        link: `https://xiaoheihe.cn/community/user/${id}/post_list`,
        item: out,
    };
};
