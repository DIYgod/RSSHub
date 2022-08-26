module.exports = {
    'asus.com.cn': {
        _name: 'Asus 华硕',
        '.': [
            {
                title: '固件',
                docs: 'https://docs.rsshub.app/program-update.html#hua-shuo',
                source: ['/'],
                target: '/asus/bios/:model',
            },
        ],
    },
    'asus.com': {
        _name: 'ASUS',
        '.': [
            {
                title: 'GPU Tweak',
                docs: 'https://docs.rsshub.app/program-update.html#hua-shuo',
                source: ['/campaign/GPU-Tweak-III/*', '/'],
                target: '/asus/gpu-tweak',
            },
        ],
    },
};
