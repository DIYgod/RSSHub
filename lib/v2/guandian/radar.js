module.exports = {
    'guandian.cn': {
        _name: '观点网',
        www: [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-dian-wang-zi-xun',
                source: ['/:category'],
                target: '/guandian/:category',
            },
        ],
    },
};
