module.exports = {
    'i-cable.com': {
        _name: '有線寬頻 i-CABLE',
        '.': [
            {
                title: '有線新聞 | Cable News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#you-xian-kuan-pin-i-cable',
                source: ['/category/*path', '/'],
                target: (params) => `/i-cable${params.path ? decodeURIComponent(params.path.slice(params.path.lastIndexOf('/'))) : ''}`,
            },
        ],
    },
};
