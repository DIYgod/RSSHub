export default {
    'logclub.com': {
        _name: '罗戈网',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/:id', '/news'],
                target: (params) => {
                    const id = params.id;

                    return `/logclub/news${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '资讯 - 供应链',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/10-16'],
                target: '/logclub/news/10-16',
            },
            {
                title: '资讯 - 快递',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/11'],
                target: '/logclub/news/11',
            },
            {
                title: '资讯 - 快运/运输',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/30'],
                target: '/logclub/news/30',
            },
            {
                title: '资讯 - 仓储/地产',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/9'],
                target: '/logclub/news/9',
            },
            {
                title: '资讯 - 物流综合',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/32'],
                target: '/logclub/news/32',
            },
            {
                title: '资讯 - 国际与跨境物流',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/114'],
                target: '/logclub/news/114',
            },
            {
                title: '资讯 - 科技创新',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/107'],
                target: '/logclub/news/107',
            },
            {
                title: '资讯 - 绿色供应链',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/213'],
                target: '/logclub/news/213',
            },
            {
                title: '资讯 - 低碳物流',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/214'],
                target: '/logclub/news/214',
            },
            {
                title: '资讯 - 碳中和碳达峰',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zi-xun',
                source: ['/news/215'],
                target: '/logclub/news/215',
            },
            {
                title: '招聘',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zhao-pin',
                source: ['/recruit'],
                target: '/logclub/recruit',
            },
            {
                title: '报告',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-bao-gao',
                source: ['/lc_report'],
                target: (params, url, document) => {
                    const id = document
                        ?.querySelector('li.layui-this[id]')
                        ?.id?.replace(/_/g, ' ')
                        .replaceAll(/\b\w/g, (c) => c.toUpperCase())
                        .replaceAll(/\s/g, '');

                    return `/logclub/lc_report${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '报告 - 罗戈研究出品',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-bao-gao',
                source: ['/lc_report'],
                target: '/logclub/lc_report/Report',
            },
            {
                title: '报告 - 物流报告',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-bao-gao',
                source: ['/lc_report'],
                target: '/logclub/lc_report/IndustryReport',
            },
            {
                title: '报告 - 绿色双碳报告',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-bao-gao',
                source: ['/lc_report'],
                target: '/logclub/lc_report/GreenDualCarbonReport',
            },
            {
                title: '招投标',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zhao-tou-biao',
                source: ['/tender'],
                target: '/logclub/tender',
            },
            {
                title: '原创',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zhao-yuan-chuang',
                source: ['/original'],
                target: '/logclub/original',
            },
            {
                title: '大企业',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zhao-da-qi-ye',
                source: ['/company/:id'],
                target: '/logclub/company/:id',
            },
            {
                title: '专家说',
                docs: 'https://docs.rsshub.app/routes/new-media#luo-ge-wang-zhao-zhuan-jia-shuo',
                source: ['/columnist/articleList/:id'],
                target: '/logclub/columnist/articleList/:id',
            },
        ],
    },
};
