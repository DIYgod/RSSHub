module.exports = {
    'openwrt.org': {
        _name: 'Openwrt',
        '.': [
            {
                title: 'Model Releases',
                docs: 'https://docs.rsshub.app/program-update.html#openwrt',
                source: '/toh/:band/:model',
                target: '/openwrt/releases/:model',
            },
        ],
    },
};
