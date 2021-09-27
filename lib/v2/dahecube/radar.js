const utils = require('./utils');

module.exports = {
    'dahecube.com': {
        _name: '大河财立方',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/government.html#xiang-gang-lian-zheng-gong-shu',
                source: ['/channel.html?recid=:id', '/index.html?recid=:id'],
                target: ({ id }) => {
                    let type = 'recommend';
                    Object.entries(utils.TYPE).entries(([key, value]) => {
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
