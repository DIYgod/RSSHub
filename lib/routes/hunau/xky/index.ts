// @ts-nocheck
const getContent = require('../utils/common');

export default async (ctx) => {
    await getContent(ctx, {
        baseHost: 'https://xky.hunau.edu.cn',
        baseCategory: 'tzgg_8472', // 默认：通知公告
        baseTitle: '信息与智能科学技术学院',
        baseDescription: '湖南农业大学信息与智能科学技术学院',
        baseDeparment: 'xky',
        baseClass: 'div.right_list ul li:has(a)',
    });
};
