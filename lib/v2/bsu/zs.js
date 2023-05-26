const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    188: {
        menuId: '188',
        name: '硕士研究生统招',
    },
    187: {
        menuId: '187',
        name: '接收推免生',
    },
    189: {
        menuId: '189',
        name: '冠军班',
    },
};

const host = 'http://zs.bsu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/api/news/list?menuId=${type.menuId}&clientType=1&pageNo=1&pageSize=12`;
    const response = await got({
        method: 'get',
        url: pageUrl,
    });
    const list = response.data.result.rows;
    const typeName = type.name || '招生网';
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.publishDate;
            const itemTitle = item.title;
            return ctx.cache.tryGet(item.id + '', async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'get',
                        url: `http://zs.bsu.edu.cn/api/news/detail?id=${item.id}`,
                    });
                    description = result.data.description;
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: `http://zs.bsu.edu.cn/detail/${item.id}`,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `北京体育大学招生网 - ${typeName}`,
        link: pageUrl,
        description: `北京体育大学招生网 - ${typeName}`,
        item: items,
    };
};
