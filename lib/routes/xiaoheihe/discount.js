const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.xiaoheihe.cn/game/web/all_recommend/games/?show_type=discount&limit=20&offset=0&os_type=web&version=999.0.0',
    });
    const data = response.data.result.list;

    ctx.state.data = {
        title: '小黑盒 Steam 热门折扣',
        link: 'https://xiaoheihe.cn/games/index',
        item: data.map((item) => ({
            title: (item.price.discount === item.price.lowest_discount ? '[史低] ' : '') + item.name + (item.name_en ? ' / ' + item.name_en : ''),
            description: `<img src="https://steamcdn-a.akamaihd.net/steam/apps/${item.appid}/header.jpg"> <br> 原价￥${item.heybox_price.original_coin / 1000}，现价￥${item.heybox_price.cost_coin / 1000}，折扣力度 ${
                item.heybox_price.discount
            }%，${item.price.deadline_date} <br> 评分：${item.score} <br> 简介：${item.about_the_game}`,
            link: `https://store.steampowered.com/app/${item.appid}/?l=zh&cc=cn`,
        })),
    };
};
