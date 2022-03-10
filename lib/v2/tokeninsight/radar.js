module.exports = {
    'tokeninsight.com': {
        _name: 'TokenInsight',
        '.': [
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/new-media.html#tokeninsight',
                source: ['/:lang/blogs'],
                target: '/tokeninsight/blog/:lang',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#tokeninsight',
                source: ['/:lang/latest'],
                target: '/tokeninsight/bulletin/:lang',
            },
            {
                title: '报告',
                docs: 'https://docs.rsshub.app/new-media.html#tokeninsight',
                source: ['/:lang/report'],
                target: '/tokeninsight/report/:lang',
            },
        ],
    },
};
