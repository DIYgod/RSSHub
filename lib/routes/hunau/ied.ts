// @ts-nocheck
const getContent = require('./utils/common');

export default async (ctx) => {
    await getContent(ctx, {
        baseHost: 'https://ied.hunau.edu.cn',
        baseCategory: 'ggtz', // 默认：公告通知
        baseType: 'xwzx', // 默认：新闻中心
        baseTitle: '国际交流与合作处',
        baseDescription: '湖南农业大学国际交流与合作处、国际教育学院、港澳台事务办公室',
        baseDeparment: 'ied',
    });
};
