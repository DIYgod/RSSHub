export default {
    'qiyoujiage.com': {
        _name: '汽油价格网',
        '.': [
            {
                title: '今日油价查询',
                docs: 'https://docs.rsshub.app/routes/other#qi-you-jia-ge-wang',
                source: ['/*'],
                target: (_, url) => `/qiyoujiage${new URL(url).pathname.replace('.shtml', '')}`,
            },
        ],
    },
};
