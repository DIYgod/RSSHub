module.exports = {
    'tingtingfm.com': {
        _name: '听听 FM',
        mobile: [
            {
                title: '节目',
                docs: 'https://docs.rsshub.app/multimedia.html#ting-ting-fm',
                source: ['/v3/program/:programId'],
                target: '/tingtingfm/program/:programId',
            },
        ],
    },
};
