const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    92: {
        key: '92',
        name: '招生信息硕士',
    },
};

const host = 'https://gs.sustech.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/api/www/v1/article/list?page=1&pageSize=20&kw=&sort_id=${type.key}&cas_sort_id=${type.key}`;
    const response = await got({
        method: 'get',
        url: pageUrl,
    });
    const list = response.data.data.items;

    const typeName = type.name || '研究生院';
    const items = await Promise.all(
        list.map((item) => {
            const itemId = item.id;
            const middle_sort_id = item.middle_sort_id;
            const itemDate = item.published_at;
            const itemTitle = item.title;
            const link = `https://gs.sustech.edu.cn/#/admission/detail?current_child_id=${middle_sort_id}&id=${type.key}&article_id=${itemId}`;
            return ctx.cache.tryGet(item.id + '', async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'get',
                        url: `${host}/api/www/v1/article/view?id=${itemId}&cas_sort_id=${type.key}`,
                    });
                    description = result.data.data.content;
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `南方科技大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `南方科技大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
