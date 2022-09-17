module.exports = {
    'liulinblog.com': {
        _name: '木木博客',
        '.': [
            {
                title: '每天六十秒（60秒）读懂世界',
                docs: 'https://docs.rsshub.app/new-media.html#mu-mu-bo-ke',
                source: ['/kuaixun'],
                target: '/liulinblog/kuaixun',
            },
            {
                title: '互联网早报',
                docs: 'https://docs.rsshub.app/new-media.html#mu-mu-bo-ke',
                source: ['/itnews/:channel'],
                target: (params) => {
                    if (params.channel === 'internet') {
                        return '/liulinblog/itnews/:channel';
                    }
                },
            },
            {
                title: '站长圈',
                docs: 'https://docs.rsshub.app/new-media.html#mu-mu-bo-ke',
                source: ['/itnews/:channel'],
                target: (params) => {
                    if (params.channel === 'seo') {
                        return '/liulinblog/itnews/:channel';
                    }
                },
            },
        ],
    },
};
