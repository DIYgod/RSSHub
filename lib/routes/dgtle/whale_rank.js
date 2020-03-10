const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const rule = ctx.params.rule;

    const stype = {
        download: '下载',
        like: '点赞',
    };

    const srule = {
        day: '日排行',
        week: '周排行',
        month: '月排行',
        amount: '总排行',
    };

    const host = 'https://www.dgtle.com';

    const response = await got({
        method: 'get',
        url: `https://opser.api.dgtle.com/v1/whale-rank/list?rule=${rule}&type=${type}`,
    });

    const items = response.data.items.map((item) => ({
        title: item.content,
        pubDate: new Date(item.updated_at * 1000).toUTCString(),
        author: item.author.username,
        description: `<img src=${item.attachment.pic_url.split('?')[0]} />`,
        link: item.attachment.pic_url.split('?')[0],
    }));

    ctx.state.data = {
        title: `数字尾巴 - 鲸图 - ${stype[type]}${srule[rule]}`,
        description: '鲸图排行榜',
        link: host,
        item: items,
    };
};
