module.exports = {
    'macupdate.com': {
        _name: 'MacUpdate',
        '.': [
            {
                title: '更新',
                docs: 'https://docs.rsshub.app/program-update.html#macupdate',
                source: ['/app/mac/:appId/:appSlug'],
                target: '/macupdate/app/:appId/:appSlug?',
            },
        ],
    },
};
