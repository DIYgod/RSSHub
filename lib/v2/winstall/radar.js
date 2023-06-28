module.exports = {
    'winstall.app': {
        _name: 'winstall',
        '.': [
            {
                title: '应用更新',
                docs: 'https://docs.rsshub.app/program-update.html#winstall',
                source: ['/apps/:appId'],
                target: '/winstall/:appId',
            },
        ],
    },
};
