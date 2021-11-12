const got = require('@/utils/got');
const util = require('./utils');
const news_url = 'https://www.nintendoswitch.com.cn/topics/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: news_url,
    });

    // 获取Nuxt对象
    const result = await util.nuxtReader(response.data);

    /* newsData[]
        category: "Nintendo Switch"
        id: "7341a73c-b4f8-4fa2-ae26-33c670743293"
        imgUrl: "//switch-cn.gtgres.com/global-images/05b83870-31cc-11ea-8066-7beee849b0db.png"
        releaseTime: 1578456319000
        title: "《新 超级马力欧兄弟U 豪华版》1月15日实体游戏卡带发售"
    */
    if (!result.newsData) {
        throw new Error('新闻信息不存在，请报告这个问题');
    }

    let data = result.newsData.map((item) => ({
        title: item.title,
        description: util.generateImageLink(`https${item.imgUrl}`),
        category: item.category,
        link: `${news_url}${item.id}`,
        pubDate: new Date(parseInt(item.releaseTime)).toUTCString(),
    }));

    data = await util.ProcessNewsChina(data, ctx.cache);

    ctx.state.data = {
        title: `Nintendo (中国大陆) 主页资讯`,
        link: `https://www.nintendo.com.hk/topics`,
        description: `Nintendo 中国大陆官网刊登的资讯`,
        item: data,
    };
};
