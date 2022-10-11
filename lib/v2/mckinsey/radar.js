const { categories } = require('./cn/categoryMap');
module.exports = {
    'mckinsey.com.cn': {
        _name: 'McKinsey Greater China',
        '.': [
            {
                title: '洞见',
                docs: 'https://docs.rsshub.app/finance.html#mai-ken-xi',
                source: ['/insights/:category', '/insights'],
                target: (params) => `/mckinsey/cn${params.category ? `/${categories.find((c) => c.slug === params.category).key}` : ''}`,
            },
        ],
    },
};
