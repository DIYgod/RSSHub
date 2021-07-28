const got = require('@/utils/got');

module.exports = async (ctx) => {
    const data = (
        await got({
            method: 'get',
            url: 'https://open-be.ele.me/dev/notice/list?curpage=1&perpage=200',
        })
    ).data;

    ctx.state.data = {
        title: '饿百零售开放平台-公告',
        link: 'https://open-be.ele.me/dev/notice',
        item: data.data.body.notice_info.map((item) => ({
            title: item.title,
            description: `更新时间: ${item.update_time}`,
            pubDate: item.create_time,
            link: `https://open-be.ele.me/dev/notice?id=${item.id}`,
        })),
    };
};
