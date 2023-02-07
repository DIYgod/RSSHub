module.exports = {
    'cast.org.cn': {
        _name: '中国科学技术协会',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/government.html#zhong-guo-ke-xue-ji-shu-xie-hui',
                source: ['/col/:column/index.html'],
                target: (params) => `/cast/${params.column.replace('col', '')}`,
            },
        ],
    },
};
