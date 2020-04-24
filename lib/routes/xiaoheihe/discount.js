const got = require('@/utils/got');

module.exports = async (ctx) => {
    const platform = ctx.params.platform || 'pc';

    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/game/get_game_list_v3?sort_type=discount&filter_head=${platform}&offset=0&limit=30&os_type=web`,
    });
    const data = response.data.result.games;

    ctx.state.data = {
        title: `小黑盒${platform.toUpperCase()}游戏折扣`,
        link: 'https://xiaoheihe.cn/games/index',
        item: data.map((item) => {
            const title = `${item.name}${item.name_en ? '/' + item.name_en : ''}`;
            let description = `
                <img src="${item.image}"/> <br/>
            `;
            if (item.platform_infos) {
                item.platform_infos.forEach((platform) => {
                    if (platform.price) {
                        if (platform.key) {
                            description += `平台: ${platform.key}<br/>>`;
                        }
                        if (platform.price.current) {
                            description += `当前价格: ${platform.price.current}${platform.price.discount === platform.price.lowest_discount ? '[史低]' : ''}<br/>`;
                        }
                        if (platform.price.initial) {
                            description += `原价: ${platform.price.initial}<br/>`;
                        }
                        if (platform.price.discount_desc) {
                            description += `折扣力度: ${platform.price.discount_desc}<br/>`;
                        }
                        if (platform.price.deadline_date) {
                            description += `截止时间: ${platform.price.deadline_date}<br/>`;
                        }
                        description += '<br/>';
                    }
                });
            } else {
                if (item.price) {
                    description += `平台: ${platform.toUpperCase()}<br/>`;
                    if (item.price.current) {
                        description += `当前价格: ${item.price.current}${item.price.discount === item.price.lowest_discount ? '[史低]' : ''}<br/>`;
                    }
                    if (item.price.initial) {
                        description += `原价: ${item.price.initial}<br/>`;
                    }
                    if (item.price.discount_desc) {
                        description += `折扣力度: ${item.price.discount_desc}<br/>`;
                    }
                    if (item.price.deadline_date) {
                        description += `截止时间: ${item.price.deadline_date}<br/>`;
                    }
                    description += '<br/>';
                }
            }
            let link = `https://xiaoheihe.cn/games/detail/${item.steam_appid}`;
            if (platform === 'pc') {
                link = `https://store.steampowered.com/app/${item.steam_appid}`;
            }
            return {
                title,
                description,
                link,
            };
        }),
    };
    // item: data.map((item) => ({
    //     title: (item.price.discount === item.price.lowest_discount ? '[史低] ' : '') + item.name + (item.name_en ? ' / ' + item.name_en : ''),
    //     description:
    //         `<img src="https://steamcdn-a.akamaihd.net/steam/apps/${item.appid}/header.jpg"> <br>` +
    //         (item.heybox_price ? ` 小黑盒: 原价￥${item.heybox_price.original_coin / 1000}，现价￥${item.heybox_price.cost_coin / 1000}，折扣力度 ${item.heybox_price.discount}% <br> ` : '') +
    //         `steam: 原价￥${item.price.initial}，现价￥${item.price.current}，折扣力度 ${item.price.discount}% ${item.price.deadline_date}`,
    //     link: `https://store.steampowered.com/app/${item.appid}/?l=zh&cc=cn`,
    // })),
};
