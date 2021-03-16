const got = require('@/utils/got');

module.exports = async (ctx) => {
    const  uid = ctx.params.uid;

    const response = await got({
        method: 'get',
        url:`https://www.iyingdi.com/bbsplus/post/list/user?page=0&sort=-created&size=10&userId=${uid}`,
        headers: {
            Referer: `https://www.iyingdi.com/web/personal/home?id=${uid}`,
        },
    });

    const username = response.data.list[0].username;
    const list = response.data.list;
    
    ctx.state.data = {
        title: ` ${username} 的帖子 -  旅法师营地`,
        link: `https://www.iyingdi.com/web/personal/home?id=${uid}`,
        description: ` ${username} 的帖子 -  旅法师营地`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.simpleContent}<br><img src="${item.cover}">`,
            pubDate: new Date(item.updated * 1000).toUTCString(),
            link: `https://www.iyingdi.com/web/bbspost/detail/${item.id}`,
        })),
    };
};
