const { getData } = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const title = '腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪';
    const link = 'https://news.qq.com/zt2020/page/feiyan.htm#/';
    const item = [];

    const chinaTotal = (await getData(['diseaseh5Shelf']))?.data?.diseaseh5Shelf?.chinaTotal || {};
    const { localConfirmH5, localWzzAdd, confirmAdd, localConfirm, nowLocalWzz, highRiskAreaNum, mtime } = chinaTotal;
    const pubDate = parseDate(mtime);
    const info = {
        title: '中国本土数据统计',
        description: art(path.join(__dirname, '../../templates/coronavirus/chinaTotal.art'), {
            localConfirmH5,
            localWzzAdd,
            confirmAdd,
            localConfirm,
            nowLocalWzz,
            highRiskAreaNum,
        }),
        pubDate,
        guid: `${link}total?pubDate=${pubDate.toISOString()}`,
    };
    item.push(info);

    ctx.state.data = {
        title,
        link,
        item,
    };
};
