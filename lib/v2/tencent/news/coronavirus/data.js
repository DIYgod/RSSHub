const { getData } = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const province = ctx.params.province || '';
    const city = ctx.params.city || '';

    const title = `${province}-${city} - 腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪`;
    const link = 'https://news.qq.com/zt2020/page/feiyan.htm#/';
    const item = [];

    const diseaseh5Shelf = (await getData(['diseaseh5Shelf']))?.data?.diseaseh5Shelf;
    const { lastUpdateTime, areaTree } = diseaseh5Shelf;
    const nationalData = areaTree?.[0];
    const provinceList = nationalData.children;

    let todayConfirm = 0;
    let totalNowConfirm = 0;
    let totalConfirm = 0;
    let totalDead = 0;
    let name = '';
    let pubDate;
    let coronavirusData = {};

    if (!province || province === '中国' || province === '全国') {
        // 没有传参则取全国
        coronavirusData = nationalData;
        pubDate = parseDate(lastUpdateTime);
    } else {
        // 分省份获取
        coronavirusData = provinceList.find((e) => e.name === province);
        if (!coronavirusData) {
            throw new Error(`未找到 ${province} 的疫情数据，请检查输入的省市名称是否正确`);
        }
        if (city) {
            // 继续获取 区县 数据
            coronavirusData = coronavirusData?.children?.find((e) => e.name === city);
            if (!coronavirusData) {
                throw new Error(`未找到 ${province}/${city} 的疫情数据，请检查输入的省市名称是否正确`);
            }
        }
        pubDate = parseDate(coronavirusData.total.mtime);
    }

    todayConfirm = coronavirusData.today.confirm;
    totalNowConfirm = coronavirusData.total.nowConfirm;
    totalConfirm = coronavirusData.total.confirm;
    totalDead = coronavirusData.total.dead;
    name = coronavirusData.name;

    const info = {
        title: `${name} - 疫情数据`,
        description: art(path.join(__dirname, '../../templates/coronavirus/data.art'), {
            todayConfirm,
            totalNowConfirm,
            totalConfirm,
            totalDead,
        }),
        pubDate,
        guid: `${link}${province}/${city}`,
    };

    item.push(info);

    ctx.state.data = {
        title,
        link,
        item,
    };
};
