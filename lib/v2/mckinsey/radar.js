module.exports = {
    'mckinsey.com.cn': {
        _name: '麦肯锡中国',
        '.': [
            {
                title: '洞见',
                docs: 'https://docs.rsshub.app/finance.html#mai-ken-xi-zhong-guo',
                source: ['/insights/:category/'],
                target: ({ category }) => `/mckinsey/${category}`,
            },
        ],
    },
};
