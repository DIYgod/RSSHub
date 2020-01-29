const got = require('@/utils/got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (ctx) => {
    const PROVINCE = ctx.params.province || '全国';
    let CITY = ctx.params.city || '';

    const link = 'https://3g.dxy.cn/newh5/view/pneumonia';

    const response = await got({
        method: 'get',
        url: link,
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const item = {};

    let AREA, DATA, META;

    const getProvince = () => {
        AREA = PROVINCE;
        DATA = dom.window.getAreaStat.find((item) => item.provinceShortName === PROVINCE);

        if (!DATA) {
            // 省份名不存在
            return getCountry();
        }

        META = dom.window.getListByCountryTypeService1.find((item) => item.provinceShortName === PROVINCE);

        if (CITY) {
            return getCity();
        }

        if (META.tags) {
            item.description = `最近更新：${META.tags}。<br><br>`;
        }

        DATA.cities.forEach((city) => {
            item.description += `${city.cityName}：确诊 ${city.confirmedCount} 例，死亡 ${city.deadCount} 例，治愈 ${city.curedCount} 例。<br><br>`;
        });

        item.title = `${AREA}新型肺炎疫情数据：确诊 ${DATA.confirmedCount} 例，疑似 ${DATA.suspectedCount} 例，死亡 ${DATA.deadCount} 例，治愈 ${DATA.curedCount} 例`;
    };

    const getCity = () => {
        AREA = CITY;
        DATA = DATA.cities.find((c) => c.cityName.includes(CITY));

        if (DATA) {
            item.title = `${DATA.cityName}：确诊 ${DATA.confirmedCount} 例，死亡 ${DATA.deadCount} 例，治愈 ${DATA.curedCount} 例`;
        } else {
            // 城市不存在
            CITY = '';
            return getProvince();
        }
    };

    const getCountry = () => {
        AREA = '全国';
        META = dom.window.getStatisticsService;

        item.title = `全国确诊 ${META.confirmedCount} 例，疑似 ${META.suspectedCount} 例，死亡 ${META.deadCount} 例，治愈 ${META.curedCount} 例。`;
    };

    if (PROVINCE !== '全国') {
        getProvince();
    } else {
        getCountry();
    }

    item.pubDate = new Date(META.modifyTime).toUTCString();
    item.link = link;
    item.guid = item.title;

    ctx.state.data = {
        title: `${AREA}新型肺炎疫情数据统计 - 丁香园`,
        link,
        item: [item],
    };
};
