const got = require('@/utils/got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://3g.dxy.cn/newh5/view/pneumonia',
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const data = dom.window.getStatisticsService;

    ctx.state.data = {
        title: '全国新型肺炎疫情数据统计（全国）-丁香园',
        link: 'https://3g.dxy.cn/newh5/view/pneumonia',
        item: [
            {
                title: data.countRemark,
                pubDate: new Date(data.modifyTime).toUTCString(),
            },
        ],
    };
};
