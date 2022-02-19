module.exports = {
    'appledaily.com': {
        _name: '苹果新闻网',
        tw: [
            {
                title: '首頁',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/:channel'],
                target: (params) => {
                    if (params.channel === 'home') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '焦点',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'recommend') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'new') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'hot') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '生活',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'life') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '娱乐',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'entertainment') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '社会',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'local') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '财经地产',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'property') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '国际',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'international') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '政治',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'politics') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '3C车城',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'gadget') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '吃喝玩乐',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'supplement') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '体育',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'sports') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '苹评理',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'forum') {
                        return '/appledaily/:channel';
                    }
                },
            },
            {
                title: '微视频',
                docs: 'https://docs.rsshub.app/traditional-media.html#ping-guo-xin-wen-wang',
                source: ['/realtime/:channel'],
                target: (params) => {
                    if (params.channel === 'micromovie') {
                        return '/appledaily/:channel';
                    }
                },
            },
        ],
    },
};
