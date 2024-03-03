export default {
    'sony.com': {
        _name: 'Sony',
        '.': [
            {
                title: 'Software Downloads',
                docs: 'https://docs.rsshub.app/routes/program-update#sony',
                source: ['/electronics/support/:productType/:productId/downloads'],
                target: '/sony/downloads/:productType/:productId',
            },
        ],
    },
};
