import type { Context } from 'hono';

import type { Route } from '@/types';

import { ProcessFeed } from './utils';

const typeMap = {
    0: '達人專欄',
    1: '達人專欄',
    2: '最新創作',
    3: '最新推薦',
    4: '熱門創作',
    5: '精選閣樓',
};

const categoryMap = {
    0: '不限',
    1: '日誌',
    2: '小說',
    3: '繪圖',
    4: 'Cosplay',
    5: '同人商品',
};

const subcategoryMap = {
    0: '不限',
    1: 'ACG相關',
    2: '生活休閒',
    3: '巴哈相關',
    4: '歡樂惡搞',
    5: '心情日記',
    6: '模型/公仔',
    7: '視聽娛樂',
    8: '興趣嗜好',
    9: '其他',
    10: '愛情',
    11: '奇幻',
    12: '科幻',
    13: '武俠',
    14: '推理驚悚',
    15: '歡樂惡搞',
    16: 'BL/GL',
    17: '輕小說',
    18: '其他',
    19: '紙上塗鴉',
    20: '草稿/線稿',
    21: '單色人物',
    22: '彩色人物',
    23: '完稿作品',
    24: '漫畫',
    25: '勇者造型',
    26: '其他',
    27: 'ACG相關',
    28: '特攝',
    29: '布袋戲',
    30: '電影',
    31: '其他',
    32: '男性向',
    33: '女性向',
    34: '其他',
};

export const route: Route = {
    path: '/creation_index/:category?/:subcategory?/:type?',
    categories: ['social-media'],
    example: '/gamer/creation_index/4/0/2',
    parameters: {
        category: '分类 ID, 即为 URL 中 `k1` 参数, 0 或置空为不限',
        subcategory: '子分类 ID, 即为 URL 中 `k2` 参数, 0 或置空为不限',
        type: '排行类型, 即为 URL 中 `vt` 参数, 0 或置空为達人專欄',
    },
    name: '创作大厅',
    maintainers: ['hoilc'],
    description: `分类 ID 参考如下

| 不限 | 日誌 | 小說 | 繪圖 | Cosplay | 同人商品 |
| ---- | ---- | ---- | ---- | ------- | -------- |
| 0    | 1    | 2    | 3    | 4       | 5        |

子分类 ID 比较多不作列举

排行类型参考如下

| 達人專欄 | 最新創作 | 最新推薦 | 熱門創作 | 精選閣樓 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = '0', subcategory = '0', type = '1' } = ctx.req.param();

    const url = `https://home.gamer.com.tw/index.php?k1=${category}&k2=${subcategory}&vt=${type}&sm=3`;

    const { items } = await ProcessFeed(url);

    return {
        title: `巴哈姆特创作大厅${category === '0' ? '' : ' - ' + categoryMap[category]}${subcategory === '0' ? '' : ' - ' + subcategoryMap[subcategory]} - ${typeMap[type]}`,
        link: url,
        item: items,
    };
}
