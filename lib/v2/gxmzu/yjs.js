const { getNoticeList } = require('./utils');

const url = 'https://yjs.gxmzu.edu.cn/tzgg/zsgg.htm';
const host = 'https://yjs.gxmzu.edu.cn';

module.exports = async (ctx) => {
    const out = await getNoticeList(ctx, url, host, 'a', '.timestyle55267', {
        title: '.titlestyle55269',
        content: '#vsb_content',
        date: '.timestyle55269',
    });

    ctx.state.data = {
        title: '广西民族大学研究生院 -- 招生公告',
        link: url,
        item: out,
    };
};
