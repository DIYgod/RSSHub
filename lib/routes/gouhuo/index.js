const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const tabIdMapping = {
        choiceness: '1_110',
        overseas: '1_108',
        orignal: '1_109',
        ps4: '2_5',
        xboxone: '2_13',
        pc: '2_1',
        switch: '2_30',
        handheld: '3_1',
        mobilegame: '3_2',
        news: '1_101',
        review: '1_104',
        culture: '1_103',
        video: '1_102',
        audio: '1_107',
        discount: '1_120',
    };
    const tabId = (() => {
        if (tabIdMapping[category]) {
            return tabIdMapping[category];
        } else {
            throw Error('Unknow route.');
        }
    })();

    const response = await got({
        method: 'get',
        url: `https://gouhuo.qq.com/content/getContentByTab?tabId=${tabId}`,
        headers: {
            Referer: `https://gouhuo.qq.com/`,
        },
    });
    const list = response.data.data.list;

    const staffs = await cache.getStaffs(ctx, tabId);
    const title = staffs[0];
    const description = staffs[1];
    const tabName = staffs[2];

    ctx.state.data = {
        title: `${title} ${tabName}`,
        link: `https://gouhuo.qq.com/`,
        description: description,
        item:
            list &&
            list.map((item) => {
                const single = {
                    title: item.title,
                    description: `${item.title}<br><img src="${item.img_url}">`, // Get fulltext manually if needs be. Snippet like: $('.widget-article').first().html();
                    pubDate: new Date(item.publish_ts * 1000).toUTCString(),
                    link: item.link,
                };
                return single;
            }),
    };
};
