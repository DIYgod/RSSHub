module.exports = {
    'ac.cn': {
        _name: '地震速报',
        'www.ceic': [
            {
                title: '中国地震台',
                docs: 'https://docs-rsshub.pages.dev/forecast.html#di-zhen-su-bao',
                source: ['/speedsearch', '/'],
                target: '/earthquake/ceic',
            },
        ],
    },
    'cea.gov.cn': {
        _name: '地震速报',
        www: [
            {
                title: '中国地震局',
                docs: 'https://docs-rsshub.pages.dev/forecast.html#di-zhen-su-bao',
                source: ['/cea/xwzx/zqsd/index.html', '/'],
                target: '/earthquake',
            },
        ],
    },
};
