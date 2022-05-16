module.exports = {
    'sputniknews.cn': {
        _name: '俄罗斯卫星通讯社',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/traditional-media.html#e-luo-si-wei-xing-tong-xun-she-fen-lei',
                source: ['/:category', '/'],
                target: '/sputniknews/:category/:language',
            },
        ],
    },
};
