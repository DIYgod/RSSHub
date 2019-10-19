const utils = {
    host: 'https://www.mcbbs.net',
    forumUrl: '/forum.php',
    forumInfos: {
        news: {
            type: 'news',
            fid: '139',
            name: '新闻资讯',
        },
        gameplay: {
            type: 'gameplay',
            fid: '39',
            name: '游戏技巧',
        },
        software: {
            type: 'software',
            fid: '43',
            name: '软件资源',
        },
        development: {
            type: 'development',
            fid: '479',
            name: '编程开发',
        },
        translation: {
            type: 'translation',
            fid: '1015',
            name: '翻译&Wiki',
        },
        arena: {
            type: 'arena',
            fid: '140',
            name: 'MCBBS擂台',
        },
        // TODO: 添加其他板块信息
    },
    getForumInfo: (type) => {
        if (isNaN(parseInt(type))) {
            return utils.forumInfos[type];
        } else {
            const fid = type;
            const infos = this.forumInfos;
            for (const type in infos) {
                if (infos[type].fid === fid) {
                    return infos[type];
                }
            }
            return null;
        }
    },
};

module.exports = utils;
