const got = require('@/utils/got');
const sign = require('./dxy-sign');

module.exports = async (ctx) => {
    const param = `noncestr=08201547&pageNum=1&pageSize=1000&timestamp=${+new Date()}`;
    const signResult = sign(`appSignKey=4bTogwpz7RzNO2VTFtW7zcfRkAE97ox6ZSgcQi7FgYdqrHqKB7aGqEZ4o7yssa2aEXoV3bQwh12FFgVNlpyYk2Yjm9d2EZGeGu3&${param}`);
    const response = await got({
        method: 'get',
        url: `https://3g.dxy.cn/newh5/case/timeline/list?${param}&sign=${signResult}`,
        headers: {
            Referer: 'https://3g.dxy.cn/newh5/view/pneumonia',
        },
    });
    const data = response.data.data.result;

    ctx.state.data = {
        title: '全国新型肺炎疫情实时动态-丁香园',
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
