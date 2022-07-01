const got = require('@/utils/got');
const { generateData } = require('./utils');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://api.zhihu.com/pins/hot_list?reverse_order=0',
    });

    ctx.state.data = {
        title: '知乎想法热榜',
        link: 'https://www.zhihu.com/',
        description: '整点更新',
        item: generateData(data),
    };
};
