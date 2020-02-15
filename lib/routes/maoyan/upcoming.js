const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://m.maoyan.com/ajax/comingList?token=',
        headers: {
            cookie: '_lxsdk_cuid=16c04ba8492c8-00efb7395fe43-4c312272-e1000-16c04ba8492c8;',
        },
    });
    const data = response.data.coming;
    const items = await Promise.all(
        data.map(async (item) => ({
            title: `${item.nm} ${item.comingTitle}`,
            description: `<img src="${item.img.replace('w.h', '1000.1000')}"> <br> 演员：${item.star} <br> 上映信息：${item.showInfo || item.comingTitle}`,
            link: `https://maoyan.com/films/${item.id}`,
            pubDate: new Date(item.rt).toUTCString(),
        }))
    );

    ctx.state.data = {
        title: `猫眼电影 - 即将上映`,
        link: `https://maoyan.com/films?showType=2`,
        description: `猫眼电影 - 即将上映`,
        item: items,
    };
};
