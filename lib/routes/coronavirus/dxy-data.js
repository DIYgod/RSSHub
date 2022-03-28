const got = require('@/utils/got');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const PROVINCE = ctx.params.province || '国内';
    let CITY = ctx.params.city || '';

    const link = 'https://ncov.dxy.cn/ncovh5/view/pneumonia';

    const response = await got({
        method: 'get',
        url: link,
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const item = {
        description: '',
    };

    let AREA, DATA, META;

    const getProvince = () => {
        AREA = PROVINCE;
        DATA = dom.window.getAreaStat.find((item) => item.provinceShortName === PROVINCE);

        if (!DATA) {
            // 省份名不存在
            return getCountry();
        }

        if (CITY) {
            return getCity();
        }

        DATA.cities.forEach((city) => {
            item.description += `${city.cityName}累计确诊 ${city.confirmedCount} 例，累计死亡 ${city.deadCount} 例，累计治愈 ${city.curedCount} 例。<br><br>`;
        });

        item.title = `${AREA}累计确诊 ${DATA.confirmedCount} 例，现存确诊 ${DATA.currentConfirmedCount} 例，累计死亡 ${DATA.deadCount} 例，累计治愈 ${DATA.curedCount} 例`;
    };

    const getCity = () => {
        AREA = CITY;
        DATA = DATA.cities.find((c) => c.cityName.includes(CITY));

        if (DATA) {
            item.title = `${DATA.cityName}累计确诊 ${DATA.confirmedCount} 例，现存确诊 ${DATA.currentConfirmedCount} 例，累计死亡 ${DATA.deadCount} 例，累计治愈 ${DATA.curedCount} 例`;
        } else {
            // 城市不存在
            CITY = '';
            return getProvince();
        }
    };

    const getCountry = () => {
        AREA = '国内';
        META = dom.window.getStatisticsService;

        item.title = `国内累计确诊 ${META.confirmedCount} 例${META.confirmedIncr ? `（较昨日 ${(META.confirmedIncr > 0 ? '+' : '') + META.confirmedIncr}）` : ''}，现存确诊 ${META.currentConfirmedCount} 例${
            META.currentConfirmedIncr ? `（较昨日 ${(META.currentConfirmedIncr > 0 ? '+' : '') + META.currentConfirmedIncr}）` : ''
        }，累计死亡 ${META.deadCount} 例${META.deadIncr ? `（较昨日 ${(META.deadIncr > 0 ? '+' : '') + META.deadIncr}）` : ''}，累计治愈 ${META.curedCount} 例${
            META.curedIncr ? `（较昨日 ${(META.curedIncr > 0 ? '+' : '') + META.curedIncr}）` : ''
        }`;
    };

    if (PROVINCE !== '国内' && PROVINCE !== '全国') {
        getProvince();
    } else {
        getCountry();
    }

    if (META && META.modifyTime) {
        item.pubDate = new Date(META.modifyTime).toUTCString();
    }
    item.link = link;
    item.guid = item.title;

    ctx.state.data = {
        title: `${AREA}新冠病毒疫情数据统计 - 丁香园`,
        link,
        item: [item],
    };
};
