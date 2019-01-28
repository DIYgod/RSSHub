const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const code_dict = {
        '1': 'home',
        '2': 'heartstone',
        '3': 'mtg',
        '4': 'videogame',
        '17': 'verse',
        '16': 'yugioh',
        '67': 'artifact',
        '62': 'twozerofortyseven',
        '9': 'boardgame',
        '22': 'mobilegame',
        '21': 'yingdi',
        '5': 'yingdistation',
        '68': 'hunwu',
        '14': 'gwent',
    };
    const host = 'https://www.iyingdi.com';
    const game = code_dict[ctx.params.typecode];
    const seed = `${game === 'home' ? 'daily/direction?direction=before&date=-1' : 'seed/v2?web=1&seed='}`;
    const url = `${host}/feed/list/${seed}${ctx.params.typecode}&system=web`;
    const response = await axios.get(url);
    const feeds = response.data.feeds;

    const items = feeds.map((element) => {
        const date = new Date(element.feed.created * 1000);
        const video = element.feed.clazz === 'video' ? 'clazz=video&' : '';
        const link = element.feed.clazz === 'bbsPost' ? 'bbspost/detail' : `article/${game}`;
        return {
            title: element.feed.title,
            description: element.feed.description,
            pubDate: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
            link: `${host}/web/${link}/${element.feed.sourceID.split('/')[0]}?${video}title=${encodeURI(element.feed.seedTitle)}&remark=seed`,
        };
    });

    ctx.state.data = {
        title: `旅法师营地 -${ctx.params.typecode === '1' ? '首页资讯' : feeds['0'].feed.seedTitle}`,
        link: `${url}`,
        item: items,
    };
};
