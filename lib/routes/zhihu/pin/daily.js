const got = require('@/utils/got');
const { generateData } = require('./utils');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://api.zhihu.com/pins/special/972884951192113152/moments?order_by=newest&reverse_order=0&limit=20',
    });

    ctx.state.data = {
        title: '知乎想法-24小时新闻汇总',
        link: 'https://www.zhihu.com/pin/special/972884951192113152',
        description: '汇集每天的社会大事、行业资讯，让你用最简单的方式获得想法里的新闻',
        item: generateData(data),
    };
};
