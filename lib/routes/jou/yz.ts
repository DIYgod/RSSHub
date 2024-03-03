// @ts-nocheck
const { getItems } = require('./utils');

const url = 'https://yz.jou.edu.cn/index/zxgg.htm';
const host = 'https://yz.jou.edu.cn';

export default async (ctx) => {
    const out = await getItems(ctx, url, host, 'winstyle207638', 'timestyle207638', 'titlestyle207543', 'timestyle207543');

    // 生成RSS源
    ctx.set('data', {
        // 项目标题
        title: '江苏海洋大学 -- 研招通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    });
};
