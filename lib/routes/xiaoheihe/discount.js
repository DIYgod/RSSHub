const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `https://api.xiaoheihe.cn/game/all_recommend/games/?show_type=discount&offset=0&limit=30&heybox_id=12777814&imei=867252032615972&os_type=Android&os_version=9&version=1.1.55&_time=1551803757&hkey=6977cde54ab859fbb98757d3e6b953d9`,
    });
    const data = response.data.result.list;

    ctx.state.data = {
        title: `小黑盒游戏打折情况`,
        link: `https://xiaoheihe.cn/games/index`,
        item: data.map((item) => ({
            title: item.game_name,
            description: `原价￥${item.heybox_price.original_coin / 1000}元，现价￥${item.heybox_price.cost_coin / 1000}元，折扣力度${item.heybox_price.discount}%OFF`,
            pubDate: ('' + item.price.deadline_date).replace(' 截止', ''),
            link: item.game_img,
        })),
    };
};
