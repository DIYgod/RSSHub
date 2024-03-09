export default {
    'gdsrx.org.cn': {
        _name: '广东省食品药品审评认证技术协会',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id'],
                target: (_, url) => {
                    url = new URL(url);

                    const idMatches = url.href.match(/\/id\/(\d+)\.html/);

                    return `/gdsrx${idMatches ? `/${idMatches[1]}` : ''}`;
                },
            },
            {
                title: '法规文库',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/10.html'],
                target: '/gdsrx/10',
            },
            {
                title: '法规资讯',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/12.html'],
                target: '/gdsrx/12',
            },
            {
                title: '专家供稿',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/13.html'],
                target: '/gdsrx/13',
            },
            {
                title: '协会动态 会员动态',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/20.html'],
                target: '/gdsrx/20',
            },
            {
                title: '协会动态',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/37.html'],
                target: '/gdsrx/37',
            },
            {
                title: '协会通知公告',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/38.html'],
                target: '/gdsrx/38',
            },
            {
                title: '会员动态',
                docs: 'https://docs.rsshub.app/routes/other#guang-dong-sheng-shi-pin-yao-pin-shen-ping-ren-zheng-ji-shu-xie-hui-lan-mu',
                source: ['/portal/list/index/id/39.html'],
                target: '/gdsrx/39',
            },
        ],
    },
};
