const axios = require('../../../utils/axios');
const { generateData } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const {
        data: { data },
    } = await axios({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/members/${id}/pins?offset=0&limit=20&includes=data%5B*%5D.upvoted_followees%2Cadmin_closed_comment`,
    });

    ctx.state.data = {
        title: `${data[0].author.name}的知乎想法`,
        link: `https://www.zhihu.com/people/${id}/pins`,
        item: generateData(data),
    };
};
