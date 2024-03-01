const { getBoards, rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const items = await getBoards(ctx.cache.tryGet);

    ctx.state.data = {
        title: 'Zuvio 校園話題列表 - 大學生論壇',
        description: 'Zuvio 校園話題，Zuvio 校園話題千種動物頭像交流心得。最萌的匿名論壇，上千種逗趣動物頭像隨你變換，點頭像立即私訊功能，讓你找到共同話題的小夥伴！多人分享配對心得、聊天交友心情在此，快加入17分享！',
        image: 'https://s3.hicloud.net.tw/zuvio.public/public/system/images/irs_v4/chicken/shared/webshare.png',
        link: `${rootUrl}/articles`,
        item: items,
        language: 'zh-Hant',
    };
};
