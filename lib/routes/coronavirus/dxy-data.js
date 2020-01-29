const got = require('@/utils/got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (ctx) => {
    const province = ctx.params.province || '全国';

    const link = 'https://3g.dxy.cn/newh5/view/pneumonia';

    const response = await got({
        method: 'get',
        url: link,
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const item = {};

    let meta;

    if (province !== '全国') {
        meta = dom.window.getListByCountryTypeService1.find((item) => item.provinceShortName === province);

        const data = dom.window.getAreaStat.find((item) => item.provinceShortName === province);

        if (data.cities) {
            item.description = '';

            if (meta.tags) {
                item.description += `最新更新：${meta.tags}。<br><br>`;
            }

            for (let i = 0; i < data.cities.length; i++) {
                const city = data.cities[i];
                item.description += `${city.cityName}：确诊 ${city.confirmedCount} 例，死亡 ${city.deadCount} 例，治愈 ${city.curedCount} 例。<br><br>`;
            }

            item.title = `${province}新型肺炎疫情数据：确诊 ${data.confirmedCount} 例，疑似 ${data.suspectedCount} 例，死亡 ${data.deadCount} 例，治愈 ${data.curedCount} 例`;
        }
    } else {
        meta = dom.window.getStatisticsService;

        item.title = `${province}确诊 ${meta.confirmedCount} 例，疑似 ${meta.suspectedCount} 例，死亡 ${meta.deadCount} 例，治愈 ${meta.curedCount} 例。`;
    }

    item.pubDate = new Date(meta.modifyTime).toUTCString();
    item.link = link;
    item.guid = item.title;

    ctx.state.data = {
        title: `全国新型肺炎疫情数据统计（${province}）-丁香园`,
        link,
        item: [item],
    };
};
