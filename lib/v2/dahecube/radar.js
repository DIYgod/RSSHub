const utils = require('./utils');

module.exports = {
    'dahecube.com': {
        _name: '大河财立方',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/new-media.html#da-he-cai-li-fang',
                source: ['/channel.html', '/index.html'],
                target: (_, url) => {
                    const id = new URL(url).searchParams.get('recid');
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
