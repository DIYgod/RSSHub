import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { calculate } from './util';

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
    pc: {
        key: 'pc',
        desc: 'PC',
    },
    switch: {
        key: 'switch',
        desc: 'Switch',
    },
    psn: {
        key: 'ps4',
        desc: 'PSN',
    },
    xbox: {
        key: 'xbox',
        desc: 'Xbox',
    },
};

function getDiscountDesc(discount) {
    return `${(100 - discount) / 10}折`;
}

function getLowestDesc(priceInfo, isSuperLowest = false) {
    if (!('is_lowest' in priceInfo) || priceInfo.is_lowest === 0) {
        return '';
    } else if (isSuperLowest) {
        return '[超史低]';
    } else if (priceInfo.is_lowest && priceInfo.is_lowest === 1 && priceInfo.new_lowest && priceInfo.new_lowest === 1) {
        return '[新史低]';
    } else if (priceInfo.is_lowest && priceInfo.is_lowest === 1) {
        return '[史低]';
    }
}

function getHeyboxPriceDesc(heyboxPriceInfo) {
    if (heyboxPriceInfo.coupon_info) {
        let discountPrice = heyboxPriceInfo.cost_coin / 1000;
        discountPrice = discountPrice - heyboxPriceInfo.coupon_info.max_reduce;
        const formatPrice = Number.isInteger(discountPrice) ? discountPrice.toFixed(0) : discountPrice.toFixed(2);
        return `| 券后价: ${formatPrice} [${heyboxPriceInfo.coupon_info.coupon_desc}]`;
    } else {
        return '';
    }
}

async function handler(ctx) {
    const platformInfo = PLATFORM_MAP[ctx.req.param('platform')];

    const dataUrl = calculate(
        `https://api.xiaoheihe.cn/game/get_game_list_v3/?filter_head=${platformInfo.key}&offset=0&limit=30&os_type=web&app=heybox&client_type=mobile&version=999.0.3&x_client_type=web&x_os_type=Mac&x_app=heybox&heybox_id=-1&include_filter=-1`
    );
    const response = await ofetch(dataUrl);
    const data = response.result.games;

    const items = data.map((item) => {
        const title = `${item.name}${item.name_en ? '/' + item.name_en : ''}`;
        let description = `
                <img src="${item.image}"/> <br/>
            `;
        if (item.platform_infos) {
            for (const platform of item.platform_infos) {
                if (platform.price) {
                    if (platform.key) {
                        description += `平台: ${platform.key.toUpperCase()}<br/>`;
                    }
                    if (platform.price.current) {
                        description += `当前价格: ${platform.price.current} ${getLowestDesc(platform.price)}<br/>`;
                    }
                    if (platform.price.initial) {
                        description += `原价: ${platform.price.initial}<br/>`;
                    }
                    if (platform.price.discount && platform.price.discount > 0) {
                        description += `折扣力度: ${getDiscountDesc(platform.price.discount)}<br/>`;
                    }
                    if (platform.price.deadline_date) {
                        description += `截止时间: ${platform.price.deadline_date}<br/>`;
                    }
                }
            }
        } else {
            if (item.price) {
                description += `平台: ${platformInfo.desc}<br/>`;
                if (item.heybox_price) {
                    description += `当前价格: ${item.price.current} ${getHeyboxPriceDesc(item.heybox_price)} ${getLowestDesc(item.price, item.heybox_price.super_lowest)}<br/>`;
                } else if (item.price.current) {
                    description += `当前价格: ${item.price.current} ${getLowestDesc(item.price)}<br/>`;
                }
                if (item.price.initial) {
                    description += `原价: ${item.price.initial}<br/>`;
                }
                if (item.price.discount && item.price.discount > 0) {
                    description += `折扣力度: ${getDiscountDesc(item.price.discount)}<br/>`;
                }
                if (item.price.deadline_date) {
                    description += `截止时间: ${item.price.deadline_date}<br/>`;
                }
            }
        }
        if (item.score) {
            description += `评分: ${item.score}<br/>`;
        }
        description += '<br/>';

        let link = `https://api.xiaoheihe.cn/game/share_game_detail?appid=${item.steam_appid}`;
        if (platformInfo.key === 'pc') {
            link = `https://store.steampowered.com/app/${item.steam_appid}`;
        }
        return {
            title,
            description,
            link,
        };
    });

    return {
        title: `小黑盒 ${platformInfo.desc} 游戏折扣`,
        link: `https://xiaoheihe.cn`,
        item: items,
    };
}
