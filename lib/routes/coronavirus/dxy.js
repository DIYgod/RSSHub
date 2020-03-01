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

    const data = dom.window.getTimelineService;

    ctx.state.data = {
        title: '全国新型肺炎疫情实时播报-丁香园',
        link: 'https://3g.dxy.cn/newh5/view/pneumonia',
        item: data.map((item) => ({
            title: item.title,
            description: item.summary,
            pubDate: new Date(item.pubDate).toUTCString(),
            author: item.infoSource,
            link: item.sourceUrl,
        })),
    };
};
