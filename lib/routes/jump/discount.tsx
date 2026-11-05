import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

const discountUrl = 'https://switch.jumpvg.com/jump/discount/find4Discount/5/v2';
// const detailUrl = 'https://switch.jumpvg.com/jump/game/detail';

// Platform API parameters.
const platformObject = {
    switch: 1,
    steam: 4,
    ps4: 51,
    ps5: 52,
};

// Category parameters for each platform.
const filterObject = {
    switch: {
        jx: 16,
        all: 17,
        sd: 18,
    },
    steam: {
        jx: 26,
        all: 27,
        dl: 28,
        sd: 29,
    },
    ps4: {
        jx: 19,
        all: 20,
        sd: 21,
        vip: 22,
    },
    ps5: {
        all: 23,
        sd: 24,
        vip: 25,
    },
};

// Category names.
const filterName = {
    jx: '精选',
    sd: '史低',
    all: '全部',
    vip: '会员',
    dl: '独立',
};

const renderDescription = (item) =>
    renderToString(
        <div>
            <img src={item.banner} />
            <table style="font-family: verdana,arial,sans-serif;font-size:11px;color:#333333;border-width: 1px;border-color: #999999;border-collapse: collapse;">
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">名称</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.name}</td>
                </tr>
                {item.subName ? (
                    <tr style="background-color:#d4e3e5;">
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">别名</td>
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.subName}</td>
                    </tr>
                ) : null}
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">中文支持</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.chinese}</td>
                </tr>
                {item.lowestPriceCountry ? (
                    <tr style="background-color:#d4e3e5;">
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">史低地区</td>
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.lowestPriceCountry}</td>
                    </tr>
                ) : null}
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">史低</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.isLowest ? '是' : '否'}</td>
                </tr>
                {item.pubDate ? (
                    <tr style="background-color:#d4e3e5;">
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">发布日期</td>
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.pubDate}</td>
                    </tr>
                ) : null}
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">当前价格</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">￥{item.price}</td>
                </tr>
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">原价</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">￥{item.originPrice}</td>
                </tr>
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">折扣地区</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.priceCountry}</td>
                </tr>
                <tr style="background-color:#d4e3e5;">
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">折扣</td>
                    <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.cutOff}%</td>
                </tr>
                {item.mcScore ? (
                    <tr style="background-color:#d4e3e5;">
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">metacritic评分</td>
                        <td style=" border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;">{item.mcScore}</td>
                    </tr>
                ) : null}
            </table>
        </div>
    );

const getSinglePageDiscountItem = async (countries, offset, platform, termsId) => {
    const url = new URL(discountUrl);
    url.search = new URLSearchParams({ countries, offset: String(offset), platform: String(platform), size: '10', termsId: String(termsId), version: '3' }).toString();
    const response = await got.get(url.href);
    return response.data.data;
};

export const route: Route = {
    path: '/discount/:platform/:filter?/:countries?',
    categories: ['game'],
    example: '/jump/discount/ps5/all',
    parameters: { platform: '平台:switch,ps4,ps5,steam', filter: '过滤参数,all-全部，jx-精选，sd-史低，dl-独立，vip-会员', countries: '地区，具体支持较多，可自信查看地区简写' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游戏折扣',
    maintainers: ['zytomorrow'],
    handler,
    description: `| switch | ps4  | ps5  | xbox   | steam | epic   |
| ------ | ---- | ---- | ------ | ----- | ------ |
| 可用   | 可用 | 可用 | 不可用 | 可用  | 不可用 |

| filter | switch | ps4 | ps5 | steam |
| ------ | ------ | --- | --- | ----- |
| all    | ✔      | ✔   | ✔   | ✔     |
| jx     | ✔      | ✔   | ❌  | ✔     |
| sd     | ✔      | ✔   | ✔   | ✔     |
| dl     | ❌     | ❌  | ❌  | ✔     |
| vip    | ❌     | ✔   | ✔   | ❌    |

| 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |
| ---- | ------------ | ---- | ---- | ---- |
| na   | eu           | fr   | de   | jp   |`,
};

async function handler(ctx) {
    const platform = ctx.req.param('platform');
    const filter = ctx.req.param('filter') || 'all';
    const countries = ctx.req.param('countries') || '';

    const platformKey = platform.toLowerCase();
    if (!Object.hasOwn(platformObject, platformKey)) {
        throw new InvalidParameterError(`Unsupported platform: ${platform}. Choose switch, steam, ps4, or ps5.`);
    }
    if (!Object.hasOwn(filterObject[platformKey], filter)) {
        throw new InvalidParameterError(`Unsupported filter for ${platform}: ${filter}. Choose ${Object.keys(filterObject[platformKey]).join(', ')}.`);
    }

    const allDiscountItem = await getSinglePageDiscountItem(countries, 0, platformObject[platformKey], filterObject[platformKey][filter]);

    return {
        title: `jump 折扣-${platform}-${filterName[filter]}${countries ? `-${countries}` : ''}`,
        link: 'https://jumpvg.com/',
        description: 'jump 发现游戏',
        item: allDiscountItem.map((item) => ({
            title: `${item.name}-${item.cutOff}%-￥${item.price}`,
            description: renderDescription(item),
            link: item.banner,
            guid: `${platform}-${item.oldGameId}-${item.cutOff}`, // Platform, game ID, and discount percentage.
        })),
    };
}
