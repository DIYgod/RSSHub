const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://search.nintendo.jp/nintendo_soft/search.json?opt_sshow=1&fq=ssitu_s%3Aonsale%20OR%20ssitu_s%3Apreorder%20OR%20memo_bg%3Aforced&limit=24&page=1&c=50310840317994813&opt_osale=1&opt_hard=1_HAC&sort=sodate%20desc%2Cscore`,
    });
    const data = response.data.result.items.slice(0, 9);

    ctx.state.data = {
        title: `Nintendo eShop (日服) 新游戏`,
        link: `https://www.nintendo.co.jp/software/switch/index.html`,
        description: `Nintendo eShop (日服) 新上架的游戏`,
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="https://img-eshop.cdn.nintendo.net/i/${item.iurl}.jpg"><br><strong>发售日期：</strong>${item.pdate}<br><strong>价格：</strong>${item.dprice}円`,
            link: `https://ec.nintendo.com/JP/ja/titles/${item.id}`,
        })),
    };
};
