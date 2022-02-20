const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const nav = ctx.params.nav || 'default';
    const link = `https://www.douban.com/channel/${id}`;

    const channel_info_response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/elessar/channel/${id}`,
        headers: {
            Referer: link,
        },
    });

    const response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/lembas/channel/${id}/feed?ck=null&for_mobile=1&start=0&count=20&nav=${nav}`,
        headers: {
            Referer: link,
        },
    });

    const channel_name = channel_info_response.data.title;
    const data = response.data.items;
    let nav_name = '';

    switch (nav) {
        case 'hot':
            nav_name = '热门';
            break;
        case 'new':
            nav_name = '最新';
            break;
        default:
            nav_name = '默认';
            break;
    }

    ctx.state.data = {
        title: `豆瓣${channel_name}频道-${nav_name}动态`,
        link,
        description: `豆瓣${channel_name}频道专题下的${nav_name}动态`,

        item: data
            .map((item) => {
                if (item.external_payload.items === undefined) {
                    const description = `作者：${item.author.name} | ${item.create_time} <br><br> ${item.abstract}">`;

                    return {
                        title: item.title,
                        description,
                        pubDate: new Date(item.create_time),
                        link: item.url,
                    };
                } else {
                    return null;
                }
            })
            .filter((item) => item),
    };
    ctx.state.data.allowEmpty = true;
};
