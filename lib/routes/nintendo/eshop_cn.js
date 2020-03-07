const got = require('@/utils/got');
const util = require('./utils');
const software_url = 'https://www.nintendoswitch.com.cn/software/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: software_url,
    });

    // 获取Nuxt对象
    const result = await util.nuxtReader(response.data);

    /* expectedReleaseNS[]
        coverImageUrl: "//switch-cn.gtgres.com/global-images/c50e3390-14e5-11ea-9b40-236e671bca9e.png"
        expectedReleaseDate: 0
        expectedReleaseDateFuzzy: ""
        gameName: "Mario Tennis Aces"
        id: 1852
        newsPageUrl: ""
      softwareData[]
        gameProductCode: "HAC-P-ADALB"
        image: "//switch-cn.gtgres.com/global-images/c247f0e0-1654-11ea-9b40-236e671bca9e.png"
        name: "新 超级马力欧兄弟U 豪华版"
        nsUid: "70010000027088"
        publisher: "任天堂"
        releaseDatetime: 1575907200000
        softcardType: (2)[]
    */
    if (!result.softwareData) {
        throw new Error('软件信息不存在，请报告这个问题');
    }

    let data = result.softwareData.map((item) => ({
        title: item.name,
        author: item.publisher,
        description: util.generateImageLink(`https${item.image}`),
        category: item.softcardType,
        link: `${software_url}${item.nsUid}`,
        pubDate: new Date(parseInt(item.releaseTime)).toUTCString(),
    }));

    data = await util.ProcessItemChina(data, ctx.cache);

    ctx.state.data = {
        title: `Nintendo eShop (国服) 新游戏`,
        link: `https://www.nintendo.com.hk/topics`,
        description: `Nintendo  (国服) 新上架的游戏`,
        item: data,
    };
};
