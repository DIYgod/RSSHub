const { categories } = require('./cn/categoryMap');
module.exports = {
    'mckinsey.com.cn': {
        _name: 'McKinsey Greater China',
        '.': Object.entries(categories).map(([key, value]) => ({
            title: `${value.name} | 洞见`,
            docs: 'https://docs.rsshub.app/finance.html#mai-ken-xi',
            source: [`/insights/${value.slug}`, '/insights'],
            target: `/mckinsey/cn/${key}`,
        })),
    },
};
