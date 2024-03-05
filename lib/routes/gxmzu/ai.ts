// @ts-nocheck
const { getNoticeList } = require('./utils');

const url = 'https://ai.gxmzu.edu.cn/index/tzgg.htm';
const host = 'https://ai.gxmzu.edu.cn';

export default async (ctx) => {
    const out = await getNoticeList(ctx, url, host, 'a', '.timestyle55267', {
        title: '.titlestyle55269',
        content: '#vsb_content',
        date: '.timestyle55269',
    });

    ctx.set('data', {
        title: '广西民族大学人工智能学院 -- 通知公告',
        link: url,
        item: out,
    });
};
