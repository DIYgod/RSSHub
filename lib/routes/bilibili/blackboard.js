const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.bilibili.com/activity/page/list?plat=1,2,3&mold=1&http=3&page=1&tid=0',
        headers: {
            Referer: 'https://www.bilibili.com/blackboard/topic_list.html',
        },
    });

    const data = response.data.data.list;

    ctx.state.data = {
        title: 'bilibili 话题列表',
        link: 'https://www.bilibili.com/blackboard/topic_list.html#/',
        description: 'bilibili 话题列表',
        item: data
            .filter(
                (item, index, array) =>
                    // 由于某些话题在不同平台上是同时分开发布的,会产生重复,在这里去除
                    !index || item.name !== array[index - 1].name
            )
            .map((item) => ({
                title: `${item.name}`,
                description: `${item.name}<br> ${item.desc}`,
                pubDate: new Date(item.ctime.replace(' ', 'T') + '+08:00').toUTCString(),
                link: `${item.pc_url}`,
            })),
    };
};
