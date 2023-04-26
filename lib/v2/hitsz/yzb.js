const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    '04': {
        key: '04',
        name: '硕士公告',
    },
    '01': {
        key: '01',
        name: '推荐免试',
    },
    '02': {
        key: '02',
        name: '统考考生',
    },
    '00': {
        key: '00',
        name: '招生简章',
    },
    11: {
        key: '11',
        name: '硕博连读',
    },
    15: {
        key: '15',
        name: '博士公告',
    },
};

const host = 'https://yzb.hitsz.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/yzs_common/zslx/createArea`;
    const response = await got({
        method: 'post',
        url: pageUrl,
        headers: {
            Origin: 'https://yzb.hitsz.edu.cn',
            Referer: `https://yzb.hitsz.edu.cn/yzs_common/zslx/index?bs=04&lx=${type.key}`,
        },
        form: {
            info: JSON.stringify({ lx: type.key, page: 1, pageSize: 12, take: 12, skip: 0 }),
        },
    });
    const list = response.data.module.data;
    const typeName = type.name || '研究生院';
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.fbsj;
            const itemTitle = item.xxbt;
            return ctx.cache.tryGet(item.id, async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'post',
                        url: 'https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/getZsxx',
                        headers: {
                            Origin: 'https://yzb.hitsz.edu.cn',
                            Referer: `https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/index?id=${item.id}&xxlm=${type.key}`,
                        },
                        form: {
                            info: JSON.stringify({ id: item.id }),
                        },
                    });
                    description = result.data.module.data.pcdxxnr;
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: `https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/index?id=${item.id}&xxlm=${type.key}`,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `哈尔滨工业大学（深圳）研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `哈尔滨工业大学（深圳）研究生招生网 - ${typeName}`,
        item: items,
    };
};
