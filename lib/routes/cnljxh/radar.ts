export default {
    'cnljxh.com': {
        _name: '中国炼焦行业协会',
        '.': [
            {
                title: '汇总',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-hui-zong',
                source: ['/collect'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('classid');

                    return `/cnljxh/collect${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '价格指数',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge-zhi-shu',
                source: ['/date'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('classid');

                    return `/cnljxh/date${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '分析数据',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-fen-xi-shu-ju',
                source: ['/info'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('classid');

                    return `/cnljxh/info${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('classid');

                    return `/cnljxh/news${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '价格',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge',
                source: ['/price'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('classid');

                    return `/cnljxh/price${id ? `/${id}` : ''}`;
                },
            },
            {
                title: '价格汇总',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-hui-zong',
                source: ['/collect'],
                target: '/cnljxh/collect/10039',
            },
            {
                title: '焦炭指数',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge-zhi-shu',
                source: ['/date'],
                target: '/cnljxh/date/5575',
            },
            {
                title: '炼焦煤指数',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge-zhi-shu',
                source: ['/date'],
                target: '/cnljxh/date/5907',
            },
            {
                title: '市场分析',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-fen-xi-shu-ju',
                source: ['/info'],
                target: '/cnljxh/info/575',
            },
            {
                title: '一周评述',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-fen-xi-shu-ju',
                source: ['/info'],
                target: '/cnljxh/info/5573',
            },
            {
                title: '核心数据',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-fen-xi-shu-ju',
                source: ['/info'],
                target: '/cnljxh/info/5417',
            },
            {
                title: '协会专区 - 协会简介',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/24',
            },
            {
                title: '协会专区 - 协会章程',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/25',
            },
            {
                title: '协会专区 - 协会领导',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/26',
            },
            {
                title: '协会专区 - 入会程序',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/27',
            },
            {
                title: '协会专区 - 组织机构',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/28',
            },
            {
                title: '协会公告',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/10',
            },
            {
                title: '行业新闻 - 协会动态',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/8',
            },
            {
                title: '行业新闻 - 企业动态',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/9',
            },
            {
                title: '行业新闻 - 行业动态',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/11',
            },
            {
                title: '政策法规',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/12',
            },
            {
                title: '行业标准 - 国家标准',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/13',
            },
            {
                title: '行业标准 - 行业标准',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/14',
            },
            {
                title: '行业标准 - 团体标准',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/15',
            },
            {
                title: '技术广角',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-xin-wen',
                source: ['/news'],
                target: '/cnljxh/news/16',
            },
            {
                title: '价格行情',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge',
                source: ['/price'],
                target: '/cnljxh/price/299',
            },
            {
                title: '双焦运费',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-lian-jiao-hang-ye-xie-hui-jia-ge',
                source: ['/price'],
                target: '/cnljxh/price/2143',
            },
        ],
    },
};
