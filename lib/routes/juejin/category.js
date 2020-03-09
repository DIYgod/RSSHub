const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const idResponse = await got({
        method: 'get',
        url: 'https://gold-tag-ms.juejin.im/v1/categories',
        headers: {
            Referer: `https://juejin.im/welcome/${category}`,
            'X-Juejin-Client': '',
            'X-Juejin-Src': 'web',
            'X-Juejin-Token': '',
            'X-Juejin-Uid': '',
        },
    });

    const cat = idResponse.data.d.categoryList.find((item) => item.title === category);
    const id = cat.id;

    const response = await got({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&limit=20&category=${id}`,
        headers: {
            Referer: `https://juejin.im/welcome/${category}`,
        },
    });

    let originalData = [];
    if (response.data.d && response.data.d.entrylist) {
        originalData = response.data.d.entrylist.slice(0, 5);
    }
    const resultItems = await util.ProcessFeed(originalData, ctx.cache);

    ctx.state.data = {
        title: `掘金${cat.name}`,
        link: `https://juejin.im/welcome/${category}`,
        description: `掘金${cat.name}`,
        item: resultItems,
    };
};
