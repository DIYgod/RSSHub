module.exports = {
    'stcn.com': {
        _name: '证券时报网',
        '.': [
            {
                title: '要闻',
                docs: 'https://docs.rsshub.app/finance.html#zheng-quan-shi-bao-wang-yao-wen',
                source: ['/xw/:id', '/gd', '/'],
                target: (params, url) => `/stcn${new URL(url).pathname}`,
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/finance.html#zheng-quan-shi-bao-wang-kuai-xun',
                source: ['/kuaixun/:id', '/kuaixun', '/'],
                target: (params, url) => `/stcn${new URL(url).pathname}`,
            },
            {
                title: '股市',
                docs: 'https://docs.rsshub.app/finance.html#zheng-quan-shi-bao-wang-gu-shi',
                source: ['/stock/:id', '/stock', '/'],
                target: (params, url) => `/stcn${new URL(url).pathname}`,
            },
            {
                title: '数据',
                docs: 'https://docs.rsshub.app/finance.html#zheng-quan-shi-bao-wang-shu-ju',
                source: ['/data/:id', '/data', '/'],
                target: (params, url) => `/stcn${new URL(url).pathname}`,
            },
        ],
    },
};
