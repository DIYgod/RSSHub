import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/add2cart/:platform',
    categories: ['game'],
    example: '/xiaoheihe/add2cart/epic',
    parameters: { platform: '平台名：epic、steam或gog' },
    name: '喜加一',
    maintainers: ['ladeng07'],
    handler,
};

async function handler(ctx) {
    const platform = ctx.req.param('platform');
    const response = await got(`https://api.xiaoheihe.cn/mall/add_to_cart/?platform=${platform}`);
    const data = response.data.result.games;

    let items = data.map((item) => {
        const title = `${item.type === 'dlc' ? '[DLC]' : ''}${item.name}${item.name_en ? '/' + item.name_en : ''}`;

        let description = `<img src="${item.image}"/> <br/>`;
        description += item.type === 'dlc' ? '本体: ' + item.product_home_name + '<br/>' : '';
        if (item.price) {
            description += `原价: ${item.price.initial_amount}<br/>`;
        }
        if (item.score) {
            description += `评分: ${item.score}<br/>`;
        }

        description += `支持中文: ${item.chinese_support ? '是' : '否'}<br/>`;

        description += `截止时间: ${parseDate(item.end_time * 1000).toLocaleString('zh-CN')}<br/>`;
        description += '<br/>';

        let link = `https://api.xiaoheihe.cn/game/share_game_detail?appid=${item.steam_appid}`;
        if (platform === 'steam') {
            link = `https://store.steampowered.com/app/${item.steam_appid}`;
        }
        return {
            title,
            description,
            link,
            pubDate: parseDate(item.end_time * 1000),
        };
    });

    if (items.length === 0) {
        items = [
            {
                title: `${platform.toUpperCase()}最近没有喜加一(悲`,
                pubDate: parseDate(response.data.result.weixindata.timestamp * 1000),
            },
        ];
    }

    return {
        title: `小黑盒 ${platform.toUpperCase()} 喜加一`,
        link: `https://xiaoheihe.cn`,
        item: items,
    };
}
