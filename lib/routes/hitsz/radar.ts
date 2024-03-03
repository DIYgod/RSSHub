export default {
    'hitsz.edu.cn': {
        _name: '哈尔滨工业大学（深圳）',
        '.': [
            {
                title: '新闻中心',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-ye-da-xue-shen-zhen',
                source: ['/article/:category?', '/subject/:category?'],
                target: (params) => `/hitsz/article/${params.category.replace('.html', '')}`,
            },
        ],
    },
};
