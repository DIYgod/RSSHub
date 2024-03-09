export default {
    'auto-stats.org.cn': {
        _name: '中国汽车工业协会统计信息网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-qi-che-xie-hui-tong-ji-xin-xi-wang-fen-lei',
                source: ['/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/auto-stats${category ? `/${category.replace(/\.asp$/, '')}` : ''}`;
                },
            },
            {
                title: '信息快递',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-qi-che-xie-hui-tong-ji-xin-xi-wang-fen-lei',
                source: ['/xxkd.asp'],
                target: '/auto-stats/xxkd',
            },
            {
                title: '工作动态',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-qi-che-xie-hui-tong-ji-xin-xi-wang-fen-lei',
                source: ['/gzdt.asp'],
                target: '/auto-stats/gzdt',
            },
            {
                title: '专题分析',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-qi-che-xie-hui-tong-ji-xin-xi-wang-fen-lei',
                source: ['/ztfx.asp'],
                target: '/auto-stats/ztfx',
            },
        ],
    },
};
