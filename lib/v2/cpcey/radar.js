module.exports = {
    'ey.gov.tw': {
        _name: '行政院消费者保护会',
        cpc: [
            {
                title: '新闻稿',
                docs: 'https://docs.rsshub.app/government.html#tai-wan-xing-zheng-yuan-xiao-fei-zhe-bao-hu-hui',
                source: '/Page/:type',
                target: (params) => {
                    if (params.type === 'A3412E2A5A7B398F') {
                        return '/cycey/xwg';
                    }
                },
            },
            {
                title: '消费资讯',
                docs: 'https://docs.rsshub.app/government.html#tai-wan-xing-zheng-yuan-xiao-fei-zhe-bao-hu-hui',
                source: '/Page/:type',
                target: (params) => {
                    if (params.type === 'E414CC218269CCE8') {
                        return '/cycey/xfzx';
                    }
                },
            },
        ],
    },
};
