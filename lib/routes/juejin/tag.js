const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const idResponse = await got({
        method: 'get',
        url: 'https://gold-tag-ms.juejin.im/v1/tags',
        headers: {
            Referer: `https://juejin.im/tag/${encodeURI(tag)}`,
            'X-Juejin-Client': '',
            'X-Juejin-Src': 'web',
            'X-Juejin-Token': '',
            'X-Juejin-Uid': '',
        },
    });

    const cat = idResponse.data.d.tags.filter((item) => item.title === tag)[0];
    const id = cat.id;

    const response = await got({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_tag_entry?src=web&tagId=${id}&page=0&pageSize=10&sort=rankIndex`,
        headers: {
            Referer: `https://juejin.im/tag/${encodeURI(tag)}`,
        },
    });

    let originalData = [];
    if (response.data.d && response.data.d.entrylist) {
        originalData = response.data.d.entrylist.slice(0, 10);
    }
    const resultItems = await util.ProcessFeed(originalData, ctx.cache);

    ctx.state.data = {
        title: `掘金${cat.title}`,
        link: `https://juejin.im/tag/${encodeURI(tag)}`,
        description: `掘金${cat.title}`,
        item: resultItems,
    };
};
