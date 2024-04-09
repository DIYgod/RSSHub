const { getItems } = require('./utils');

const url = 'https://www.jou.edu.cn/index/tzgg.htm';
const host = 'https://www.jou.edu.cn';

module.exports = async (ctx) => {
    const out = await getItems(ctx, url, host, 'winstyle106390', 'timestyle106390', 'titlestyle106402', 'timestyle106402');

    // 生成RSS源
    ctx.state.data = {
        // 项目标题
        title: '江苏海洋大学 -- 通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
};
