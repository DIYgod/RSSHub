const got = require('@/utils/got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (ctx) => {
    const province = ctx.params.province;
    const response = await got({
        method: 'get',
        url: 'https://3g.dxy.cn/newh5/view/pneumonia',
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const data = dom.window.getAreaStat.find((item) => item.provinceShortName === province);
    let descriptionCity = '';
    if (data.cities) {
        for (let i = 0; i < data.cities.length; i++) {
            descriptionCity += `<br><br>${data.cities[i].cityName}：确诊 ${data.cities[i].confirmedCount} 例，死亡 ${data.cities[i].deadCount} 例，治愈 ${data.cities[i].curedCount} 例`;
        }
    }

    const title = `确诊 ${data.confirmedCount} 例，死亡 ${data.deadCount} 例，治愈 ${data.curedCount} 例`;

    ctx.state.data = {
        title: `全国新型肺炎疫情数据统计（${province}）-丁香园`,
        link: 'https://3g.dxy.cn/newh5/view/pneumonia',
        item: data && [
            {
                title: title,
                description: `${title}${descriptionCity}`,
                pubDate: new Date(dom.window.getStatisticsService.modifyTime).toUTCString(),
                link: 'https://3g.dxy.cn/newh5/view/pneumonia',
            },
        ],
    };
};
