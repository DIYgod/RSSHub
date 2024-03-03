export default {
    'macupdate.com': {
        _name: 'MacUpdate',
        '.': [
            {
                title: '更新',
                docs: 'https://docs.rsshub.app/routes/program-update#macupdate',
                source: ['/app/mac/:appId/:appSlug'],
                target: '/macupdate/app/:appId/:appSlug?',
            },
        ],
    },
};
