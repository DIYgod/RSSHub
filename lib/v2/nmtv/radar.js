module.exports = {
    'nmtv.cn': {
        _name: '内蒙古广播电视台',
        '.': [
            {
                title: '点播',
                docs: 'https://docs.rsshub.app/traditional-media.html#nei-meng-gu-guang-bo-dian-shi-tai-dian-bo',
                source: ['/'],
                target: (params, url) => `/nmtv/column/${new URL(url).toString.split(/\/folder/).pop()}`,
            },
        ],
    },
};
