export default {
    'nmtv.cn': {
        _name: '内蒙古广播电视台',
        '.': [
            {
                title: '点播',
                docs: 'https://docs.rsshub.app/routes/traditional-media#nei-meng-gu-guang-bo-dian-shi-tai-dian-bo',
                source: ['/'],
                target: (params, url) => `/nmtv/column/${url.split(/\/folder/).pop()}`,
            },
        ],
    },
};
