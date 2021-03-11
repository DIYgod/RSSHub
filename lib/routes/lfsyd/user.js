const got = require('@/utils/got');

module.exports = async (ctx) => {
    /* const topic = ctx.params.topic;
    const urlEncodedTopic = encodeURIComponent(topic); */
    const { uid } = ctx.params;

    const response = await got({
        method: 'get',
        url:`https://www.iyingdi.com/bbsplus/post/list/user?page=0&sort=-created&size=5&userId=${uid}` ,
        headers: {
            Referer: `https://www.iyingdi.com/web/personal/home?id=${uid}`,
        },    
    });
    
    const list = response.data.list;

    ctx.state.data = {
        title: `${uid}的的帖子`,
        link: `https://www.iyingdi.com/web/personal/home?id=${uid}`,
        description: `${uid}的的帖子`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.simpleContent}<br><img src="${item.cover}">`,
            pubDate: new Date(item.updated * 1000).toUTCString(),
            link: `https://www.iyingdi.com/web/bbspost/detail/${item.id}/`,
            
        })),
    };
};
