module.exports = {
    'polkaworld.org': {
        _name: 'PolkaWorld',
        www: [
            {
                title: '最新资讯',
                docs: 'https://docs.rsshub.app/routes/blog#polkaworld',
                source: ['/', '/articles/:name'],
                target: '/polkaworld/newest',
            },
        ],
    },
};
