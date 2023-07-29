const GetContent = require('../utils/Common');

module.exports = async (ctx) => {
    await GetContent(ctx, {
        baseHost: 'https://gfxy.hunau.edu.cn',
        baseCategory: 'tzgg', // 默认：通知公告
        baseTitle: '公共管理与法学学院',
        baseDescription: '湖南农业大学公共管理与法学学院',
        baseDeparment: 'gfxy',
    });
};
