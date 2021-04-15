const date = require('@/utils/date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const baseUrl = `https://www.iyingdi.com`;
    const userUrl = `${baseUrl}/web/personal/home?id=${id}`;
    const listUrl = `${baseUrl}/bbsplus/post/list/user?page=0&sort=-created&size=20&userId=${id}`;

    const response = await got({
        method: 'get',
        url: listUrl,
        headers: {
            Referer: userUrl,
        },
    });

    const username = response.data.list[0].username;
    const list = response.data.list;

    const articleList = list.map((item) => ({
        title: item.title,
        link: `${baseUrl}/bbsplus/comment/list/post?postId=${item.id}&token=&system=web&page=0`,
        pubDate: date(item.updated * 1000, +8),
        guid: item.title,
    }));

    const items = await Promise.all(
        articleList.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const postResponse = await got.get(item.link);
                    const bbsPost = postResponse.data.post.bbsPost;

                    item.description = bbsPost.content;
                    item.link = `${baseUrl}/web/bbspost/detail/${bbsPost.id}`;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${username} - 旅法师营地`,
        link: `${userUrl}`,
        description: `${username} - 旅法师营地`,
        item: items,
    };
};
