const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.xiaoheihe.cn/game/get_game_list_v3?sort_type=discount&limit=20&os_type=web',
    });
    const data = response.data.result.games;

    ctx.state.data = {
        title: '小黑盒 Steam 热门折扣',
        link: 'https://xiaoheihe.cn/games/index',
        item: data.map((item) => ({
            title: (item.price.discount === item.price.lowest_discount ? '[史低] ' : '') + item.name + (item.name_en ? ' / ' + item.name_en : ''),
            description:
                `<img src="https://steamcdn-a.akamaihd.net/steam/apps/${item.appid}/header.jpg"> <br>` +
                (item.heybox_price ? ` 小黑盒: 原价￥${item.heybox_price.original_coin / 1000}，现价￥${item.heybox_price.cost_coin / 1000}，折扣力度 ${item.heybox_price.discount}% <br> ` : '') +
                `steam: 原价￥${item.price.initial}，现价￥${item.price.current}，折扣力度 ${item.price.discount}% ${item.price.deadline_date}`,
            link: `https://store.steampowered.com/app/${item.appid}/?l=zh&cc=cn`,
        })),
    };
};
