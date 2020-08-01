const utils = require('./utils');

const type_map = {
    0: '達人專欄',
    1: '達人專欄',
    2: '最新創作',
    3: '最新推薦',
    4: '熱門創作',
    5: '精選閣樓',
};

const category_map = {
    0: '不限',
    1: '日誌',
    2: '小說',
    3: '繪圖',
    4: 'Cosplay',
    5: '同人商品',
};

const subcategory_map = {
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

module.exports = async (ctx) => {
    const type = ctx.params.type ? ctx.params.type : '1';
    const category = ctx.params.category ? ctx.params.category : '0';
    const subcategory = ctx.params.subcategory ? ctx.params.subcategory : '0';

    const url = `https://home.gamer.com.tw/index.php?k1=${category}&k2=${subcategory}&vt=${type}&sm=3`;

    const { items } = await utils.ProcessFeed(url, ctx);

    ctx.state.data = {
        title: `巴哈姆特创作大厅${category !== '0' ? ' - ' + category_map[category] : ''}${subcategory !== '0' ? ' - ' + subcategory_map[subcategory] : ''} - ${type_map[type]}`,
        link: url,
        item: items,
    };
};
