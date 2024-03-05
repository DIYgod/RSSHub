const TYPE = {
    recommend: {
        name: '推荐',
        id: 1,
    },
    history: {
        name: '党史',
        id: 37,
    },
    stock: {
        name: '豫股',
        id: 2,
    },
    business: {
        name: '财经',
        id: 4,
    },
    education: {
        name: '投教',
        id: 36,
    },
    finance: {
        name: '金融',
        id: 5,
    },
    science: {
        name: '科创',
        id: 19,
    },
    invest: {
        name: '投融',
        id: 29,
    },
    column: {
        name: '专栏',
        id: 33,
    },
};

function parseUrl(type) {
    return type === 'recommend' ? 'https://www.dahecube.com/index.html?recid=1' : `https://www.dahecube.com/channel.html?recid=${TYPE[type].id}`;
}

module.exports = {
    TYPE,
    parseUrl,
};
