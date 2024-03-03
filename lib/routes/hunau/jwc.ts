// @ts-nocheck
const getContent = require('./utils/common');

export default async (ctx) => {
    await getContent(ctx, {
        baseHost: 'https://jwc.hunau.edu.cn',
        baseCategory: 'tzgg', // 默认：通知公告
        baseTitle: '湖南农业大学教务处',
        baseDeparment: 'jwc',
    });
};
