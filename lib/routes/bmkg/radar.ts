export default {
    'bmkg.go.id': {
        _name: 'BMKG 印尼气象气候和地球物理局',
        '.': [
            {
                title: '最近的地震',
                docs: 'https://docs.rsshub.app/routes/new-media#BMKG-yin-ni-qi-xiang-qi-hou-he-di-qiu-wu-li-ju',
                source: ['/', '/gempabumi-terkini.html'],
                target: '/bmkg/earthquake',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#BMKG-yin-ni-qi-xiang-qi-hou-he-di-qiu-wu-li-ju',
                source: ['/', '/berita'],
                target: '/bmkg/news',
            },
        ],
    },
};
