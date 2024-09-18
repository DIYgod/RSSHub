const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    11: {
        key: '11',
        name: '北京',
    },
    12: {
        key: '12',
        name: '天津',
    },
    13: {
        key: '13',
        name: '河北',
    },
    14: {
        key: '14',
        name: '山西',
    },
    15: {
        key: '15',
        name: '内蒙古',
    },
    21: {
        key: '21',
        name: '辽宁',
    },
    22: {
        key: '22',
        name: '吉林',
    },
    23: {
        key: '23',
        name: '黑龙江',
    },
    31: {
        key: '31',
        name: '上海',
    },
    32: {
        key: '32',
        name: '江苏',
    },
    33: {
        key: '33',
        name: '浙江',
    },
    34: {
        key: '34',
        name: '安徽',
    },
    35: {
        key: '35',
        name: '福建',
    },
    36: {
        key: '36',
        name: '江西',
    },
    37: {
        key: '37',
        name: '山东',
    },
    41: {
        key: '41',
        name: '河南',
    },
    42: {
        key: '42',
        name: '湖北',
    },
    43: {
        key: '43',
        name: '湖南',
    },
    44: {
        key: '44',
        name: '广东',
    },
    45: {
        key: '45',
        name: '广西',
    },
    46: {
        key: '46',
        name: '海南',
    },
    50: {
        key: '50',
        name: '重庆',
    },
    51: {
        key: '51',
        name: '四川',
    },
    52: {
        key: '52',
        name: '贵州',
    },
    53: {
        key: '53',
        name: '云南',
    },
    54: {
        key: '54',
        name: '西藏',
    },
    61: {
        key: '61',
        name: '陕西',
    },
    62: {
        key: '62',
        name: '甘肃',
    },
    63: {
        key: '63',
        name: '青海',
    },
    64: {
        key: '64',
        name: '宁夏',
    },
    65: {
        key: '65',
        name: '新疆',
    },
};

const host = 'https://yzst.chsi.com.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/sswbgg/pages/list/${type.key}.json`;
    const response = await got({
        method: 'get',
        url: pageUrl,
    });
    const list = response.data.msg || [];
    const typeName = type.name;
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.fbsj;
            const itemTitle = item.bt;
            return ctx.cache.tryGet(item.id, async () => {
                let description = itemTitle;
                try {
                    const url = `https://yzst.chsi.com.cn/sswbgg/pages/msgdetail2/${type.key}/${item.id}.json`;
                    const result = await got({
                        method: 'get',
                        url,
                    });
                    description = result.data.msg.nr;
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: `https://yz.chsi.com.cn/sswbgg/pages/msgdetail.do?dwdm=${type.key}&msg_id=${item.id}`,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `研招网网报公告 - ${typeName}`,
        link: pageUrl,
        description: `研招网网报公告 - ${typeName}`,
        item: items,
    };
};
