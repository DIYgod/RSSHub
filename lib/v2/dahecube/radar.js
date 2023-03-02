const utils = require('./utils');

module.exports = {
    'dahecube.com': {
        _name: '大河财立方',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/new-media.html#da-he-cai-li-fang',
                source: ['/channel.html?recid=:id', '/index.html?recid=:id'],
                target: ({ id }) => {
                    let type = 'recommend';
                    Object.entries(utils.TYPE).forEach(([key, value]) => {
                        if (value.id === id) {
                            type = key;
                        }
                    });
                    return `/dahecube/${type}`;
                },
            },
        ],
    },
};
