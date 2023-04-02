module.exports = {
    'ptu.edu.cn': {
        _name: '莆田学院新闻网',
        news: [
            {
                title: '莆院要闻',
                docs: 'https://docs.rsshub.app/shopping.html#pu-tian-xue-yuan',
                source: ['/:type'],
                target: (params) => `/ptu/news/${params.type.replace('.htm', '')}`,
            },
            {
                title: '莆院快讯',
                docs: 'https://docs.rsshub.app/shopping.html#pu-tian-xue-yuan',
                source: ['/:type'],
                target: (params) => `/ptu/news/${params.type.replace('.htm', '')}`,
            },
            {
                title: '媒体莆院',
                docs: 'https://docs.rsshub.app/university.html#pu-tian-xue-yuan',
                source: ['/:type'],
                target: (params) => `/ptu/news/${params.type.replace('.htm', '')}`,
            },
        ],
    },
};
