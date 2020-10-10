const got = require('@/utils/got');
const { generateData } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const {
        data: { data },
    } = await got({
        method: 'get',
        url: `https://api.zhihu.com/pins/${id}/moments?limit=10&offset=0`,
    });

    ctx.state.data = {
        title: `${data[0].target.author.name}的知乎想法`,
        link: `https://www.zhihu.com/people/${id}/pins`,
        item: generateData(data),
    };
};
