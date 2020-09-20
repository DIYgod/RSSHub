const got = require('@/utils/got');

module.exports = async (ctx) => {
    const code_dict = {
        1: 'home',
        2: 'heartstone',
        3: 'mtg',
        4: 'videogame',
        17: 'verse',
        16: 'yugioh',
        67: 'artifact',
        62: 'twozerofortyseven',
        9: 'boardgame',
        22: 'mobilegame',
        21: 'yingdi',
        5: 'yingdistation',
        68: 'hunwu',
        14: 'gwent',
    };
    const host = 'https://www.iyingdi.com';
    const game = code_dict[ctx.params.typecode];
    let url;
    if (game === 'home') {
        url = `${host}/feed/list/user/v3?feedIdUp=0&feedIdDown=0&feedSize=30&RSSize=10&hotfeed=1&system=web`;
    } else {
        url = `${host}/feed/list/seed/v2?web=1&seed=${ctx.params.typecode}&system=web`;
    }
    const response = await got.get(url);
    const feeds = response.data.feeds;

    const items = feeds
        .map((element) => {
            const date = new Date(element.feed.created * 1000);
            const video = element.feed.clazz === 'video' ? 'clazz=video&' : '';
            const link = element.feed.clazz === 'bbsPost' ? 'bbspost/detail' : `article/${game}`;
            return {
                title: element.feed.title,
                description: `<img src="${element.feed.icon}" /><br><p>${element.feed.description}</p>`,
                pubDate: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
                link: `${host}/web/${link}/${element.feed.sourceID.split('/')[0]}?${video}title=${encodeURI(element.feed.seedTitle)}&remark=seed`,
            };
        })
        .filter((item) => item.title !== undefined);

    ctx.state.data = {
        title: `旅法师营地 - ${ctx.params.typecode === '1' ? '首页资讯' : feeds['0'].feed.seedTitle}`,
        link: `${url}`,
        item: items,
    };
};
