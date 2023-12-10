module.exports = {
    'tradingview.com': {
        _name: 'TradingView',
        '.': [
            {
                title: 'Blog',
                docs: 'https://docs.rsshub.app/routes/program-update#tradingview-blog',
                source: ['/blog/:language', '/'],
                target: '/tradingview/blog',
            },
        ],
    },
};
