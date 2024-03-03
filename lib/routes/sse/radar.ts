export default {
    'sse.com.cn': {
        _name: '上海证券交易所',
        bond: [
            {
                title: '可转换公司债券公告',
                docs: 'https://docs.rsshub.app/routes/finance#shang-hai-zheng-quan-jiao-yi-suo',
                source: ['/disclosure/announ/convertible', '/'],
                // target: '/sse/convert/:query',
            },
        ],
        kcb: [
            {
                title: '科创板项目动态',
                docs: 'https://docs.rsshub.app/routes/finance#shang-hai-zheng-quan-jiao-yi-suo',
                source: ['/home', '/'],
                target: '/sse/renewal',
            },
        ],
        www: [
            {
                title: '监管问询',
                docs: 'https://docs.rsshub.app/routes/finance#shang-hai-zheng-quan-jiao-yi-suo',
                source: ['/disclosure/credibility/supervision/inquiries', '/'],
                target: '/sse/inquire',
            },
            {
                title: '上市公司信息最新公告披露',
                docs: 'https://docs.rsshub.app/routes/finance#shang-hai-zheng-quan-jiao-yi-suo',
                source: ['/assortment/stock/list/info/announcement/index.shtml', '/'],
                // target: '/sse/disclosure/:query'
            },
            {
                title: '本所业务指南与流程',
                docs: 'https://docs.rsshub.app/routes/finance#shang-hai-zheng-quan-jiao-yi-suo',
                source: ['/lawandrules/guide/*slug', '/'],
                target: (params) => `/sse/lawandrules/${params.slug.replaceAll('/', '-')}`,
            },
        ],
    },
};
