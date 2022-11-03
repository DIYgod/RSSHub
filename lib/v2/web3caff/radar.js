module.exports = {
    'web3caff.com': {
        _name: 'web3caff',
        '.': [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/new-media.html#web3caff-fa-xian',
                source: ['/'],
                target: (params, url) => `/web3caff${new URL(url).toString().match(/\.com(.*)/)[1]}`,
            },
        ],
    },
};
