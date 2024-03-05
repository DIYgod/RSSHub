export default {
    'iqilu.com': {
        _name: '齐鲁网',
        v: [
            {
                title: '电视节目',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/iqilu/v${category ? `/${category}` : ''}`;
                },
            },
            {
                title: '山东新闻联播',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/sdws/sdxwlb'],
                target: '/iqilu/v/sdws/sdxwlb',
            },
            {
                title: '闪电大视野',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/ggpd/sddsy'],
                target: '/iqilu/v/ggpd/sddsy',
            },
            {
                title: '山东三农新闻联播',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/nkpd/snxw'],
                target: '/iqilu/v/nkpd/snxw',
            },
            {
                title: '每日新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/qlpd/mrxw'],
                target: '/iqilu/v/qlpd/mrxw',
            },
            {
                title: '新闻午班车',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/ggpd/xwwbc'],
                target: '/iqilu/v/ggpd/xwwbc',
            },
            {
                title: '戏宇宙',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/sdws/xyz/'],
                target: '/iqilu/v/sdws/xyz/',
            },
            {
                title: '中国礼 中国乐',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/qlpd/zglzgy'],
                target: '/iqilu/v/qlpd/zglzgy',
            },
            {
                title: '超级语文课',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/sdws/cjywk'],
                target: '/iqilu/v/sdws/cjywk',
            },
            {
                title: '文物里的山东',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/yspd/wwldsd'],
                target: '/iqilu/v/yspd/wwldsd',
            },
            {
                title: '拉呱',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/qlpd/l0'],
                target: '/iqilu/v/qlpd/l0',
            },
            {
                title: '生活帮',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/shpd/shb'],
                target: '/iqilu/v/shpd/shb',
            },
            {
                title: '快乐大赢家',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/zypd/kldyj'],
                target: '/iqilu/v/zypd/kldyj',
            },
            {
                title: '乡村季风',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/nkpd/xcjf'],
                target: '/iqilu/v/nkpd/xcjf',
            },
            {
                title: '健康是1',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/ggpd/jks1'],
                target: '/iqilu/v/ggpd/jks1',
            },
            {
                title: '此时此刻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#qi-lu-wang-dian-shi-jie-mu',
                source: ['/sdws/cishicike'],
                target: '/iqilu/v/sdws/cishicike',
            },
        ],
    },
};
