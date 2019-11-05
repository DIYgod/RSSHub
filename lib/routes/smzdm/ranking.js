const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { rank_type, rank_id, hour } = ctx.params;

    const response = await got({
        method: 'get',
        url: `https://www.smzdm.com/top/json_more?rank_type=${rank_type}&rank_id=${rank_id}&hour=${hour}`,
        headers: {
            Referer: 'https://www.smzdm.com/top/',
        },
    });

    const data = response.data.data.list;
    const list1 = [];
    const list2 = [];
    for (let i = 0; i < Math.min(6, data.length); i++) {
        if (data[i][0].length !== 0) {
            list1.push(data[i][0]);
        }
        if (data[i][1].length !== 0) {
            list2.push(data[i][1]);
        }
    }
    const list = [...list1, ...list2];

    ctx.state.data = {
        title: `${rank_type}榜-${rank_id}-${hour}小时`,
        link: 'https://www.smzdm.com/top/',
        allowEmpty: true,
        item: list.map((item) => ({
            title: `${item.article_title} - ${item.article_price}`,
            description: `${item.article_title} - ${item.article_price}<br><img src="${item.article_pic}">`,
            pubDate: new Date(item.article_pubdate).toUTCString(),
            link: item.article_url,
        })),
    };
};
