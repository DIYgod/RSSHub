export default {
    'mrm.com.cn': {
        _name: '华储网',
        '.': [
            {
                title: '通知',
                docs: 'https://docs.rsshub.app/finance#hua-chu-wang',
                source: ['/:category'],
                target: (params) => `/mrm/${params.category.replace('.html', '')}`,
            },
        ],
    },
};
