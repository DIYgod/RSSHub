const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${+new Date()}`,
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });

    const list = response.data.data.archives;
    let name = '未知';
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    ctx.state.data = {
        title: `bilibili ${name}分区`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区`,
        item:
            list &&
            list.map((item) => ({
                title: `${item.title}`,
                description: `${item.desc}<img src="${item.pic}">`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    };
};
