export default {
    'openwrt.org': {
        _name: 'Openwrt',
        '.': [
            {
                title: 'Model Releases',
                docs: 'https://docs.rsshub.app/routes/program-update#openwrt',
                source: '/toh/:band/:model',
                target: '/openwrt/releases/:model',
            },
        ],
    },
};
