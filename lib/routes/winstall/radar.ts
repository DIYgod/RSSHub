export default {
    'winstall.app': {
        _name: 'winstall',
        '.': [
            {
                title: '应用更新',
                docs: 'https://docs.rsshub.app/routes/program-update#winstall',
                source: ['/apps/:appId'],
                target: '/winstall/:appId',
            },
        ],
    },
};
