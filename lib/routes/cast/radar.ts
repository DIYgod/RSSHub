export default {
    'cast.org.cn': {
        _name: '中国科学技术协会',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-ji-shu-xie-hui',
                source: ['/:column/:subColumn/:category/index.html', '/:column/:subColumn/index.html'],
                target: (params) => (params.category ? `/cast/${params.column}/${params.subColumn}/${params.category}` : `/cast/${params.column}/${params.subColumn}`),
            },
        ],
    },
};
