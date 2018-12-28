const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await axios({
        method: 'get',
        url:
            'https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583',
    });

    ctx.state.data = {
        title: '微博热搜榜',
        link: 'https://s.weibo.com/top/summary?cate=realtimehot',
        description: '实时热点，每分钟更新一次',
        item: data.cards[0].card_group.map((item) => {
            const title = item.desc;
            const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
            const description = item.desc;

            return {
                title,
                description,
                link,
            };
        }),
    };
};
