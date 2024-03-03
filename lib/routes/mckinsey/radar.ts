const { categories } = require('./cn/category-map');
export default {
    'mckinsey.com.cn': {
        _name: 'McKinsey Greater China',
        '.': Object.entries(categories).map(([key, value]) => ({
            title: `${value.name} | 洞见`,
            docs: 'https://docs.rsshub.app/routes/finance#mai-ken-xi',
            source: [`/insights/${value.slug}`, '/insights'],
            target: `/mckinsey/cn/${key}`,
        })),
    },
};
