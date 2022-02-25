module.exports = {
    'dtcj.com': {
        _name: 'DT 财经',
        '.': [
            {
                title: '数据侠专栏',
                docs: 'https://docs.rsshub.app/finance.html#dt-cai-jing',
                source: ['/datahero/topic'],
                target: (_params, url) => `/dtcj/datahero/${new URL(url).searchParams.get('topic_id')}`,
            },
            {
                title: '数据洞察',
                docs: 'https://docs.rsshub.app/finance.html#dt-cai-jing',
                source: ['/dtcj/datainsight'],
                target: '/dtcj/datainsight',
            },
            {
                title: '数据洞察',
                docs: 'https://docs.rsshub.app/finance.html#dt-cai-jing',
                source: ['/insighttopic/:id'],
                target: '/dtcj/datainsight/:id',
            },
        ],
    },
};
