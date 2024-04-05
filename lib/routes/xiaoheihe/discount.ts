import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/discount/:platform',
    categories: ['game'],
    example: '/xiaoheihe/discount/pc',
    parameters: { platform: '平台分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游戏折扣',
    maintainers: ['tssujt'],
    handler,
    description: `| PC  | Switch  | PSN   | Xbox |
  | ----- | ------ | ----- | ----- |
  | pc    | switch | psn   | xbox  |`,
};

const PLATFORM_MAP = {
    pc: 'PC',
    switch: 'Switch',
    psn: 'PSN',
    xbox: 'Xbox',
};

async function handler(ctx) {
    const platform = ctx.req.param('platform');

    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/game/get_game_list_v3?sort_type=discount&filter_head=${platform}&offset=0&limit=30&os_type=web`,
    });
    const data = response.data.result.games;

    const items = data.map((item) => {
        const title = `${item.name}${item.name_en ? '/' + item.name_en : ''}`;
        let description = `
                <img src="${item.image}"/> <br/>
            `;
        if (item.platform_infos) {
            for (const platform of item.platform_infos) {
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
            }
        } else {
            if (item.price) {
                description += `平台: ${platform.toUpperCase()}<br/>`;
                if (item.price.discount) {
                    description += `折扣力度: ${(100 - item.price.discount) / 10}折<br/>`;
                }
                if (item.price.initial && item.price.discount) {
                    const current = Math.round((item.price.initial * (100 - item.price.discount)) / 100);
                    description += `当前价格: ${current}${item.price.discount === item.price.lowest_discount ? '[史低]' : ''}&nbsp;&nbsp;`;
                }
                if (item.price.initial) {
                    description += `原价: ${item.price.initial}<br/>`;
                }
                if (item.score) {
                    description += `评分: ${item.score}<br/>`;
                }
                description += '<br/>';
            }
        }
        let link = `https://api.xiaoheihe.cn/game/share_game_detail?appid=${item.steam_appid}`;
        if (platform === 'pc') {
            link = `https://store.steampowered.com/app/${item.steam_appid}`;
        }
        return {
            title,
            description,
            link,
        };
    });

    return {
        title: `小黑盒 ${PLATFORM_MAP[platform]} 游戏折扣`,
        link: `https://xiaoheihe.cn`,
        item: items,
    };
}
