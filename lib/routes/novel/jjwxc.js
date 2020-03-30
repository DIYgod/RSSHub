const got = require('@/utils/got');

module.exports = async (ctx) => {
    const novelId = ctx.params.nid;

    let response = await got({
        method: 'get',
        url: `https://app-ios-cdn.jjwxc.net/iosapi/novelbasicinfo?novelId=${novelId}`,
        headers: {
            'User-Agent': 'JINJIANG-iOS/4.4.2 (iPhone; iOS 13.1; Scale/3.00)',
        },
    });
    const basicData = response.data;

    response = await got({
        method: 'get',
        url: `https://app-ios-cdn.jjwxc.net/iosapi/chapterList?novelId=${novelId}`,
        headers: {
            'User-Agent': 'JINJIANG-iOS/4.4.2 (iPhone; iOS 13.1; Scale/3.00)',
        },
    });
    const chapterData = response.data.chapterlist;

    ctx.state.data = {
        title: `《${basicData.novelName}》 by ${basicData.authorName} 最近章节`,
        link: `https://m.jjwxc.net/book2/${basicData.novelId}`,
        description: `${basicData.novelIntroShort}`,
        item: chapterData.map((item) => ({
            title: item.chaptername,
            description: item.chapterintro,
            pubDate: new Date(`${item.chapterdate} +0800`).toUTCString(),
            link: `https://m.jjwxc.net/book2/${item.novelid}/${item.chapterid}`,
        })),
    };
};
