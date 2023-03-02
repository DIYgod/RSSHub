module.exports = {
    'anquanke.com': {
        _name: '安全客',
        '.': [
            {
                title: '分类订阅',
                docs: 'https://docs.rsshub.app/programming.html#an-quan-ke',
                source: ['/:category', '/'],
                target: (params) => `/anquanke/${params.category === 'week-list' ? 'week' : params.category}`,
            },
        ],
    },
};
