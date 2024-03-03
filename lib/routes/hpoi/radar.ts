export default {
    'hpoi.net': {
        _name: 'Hpoi手办维基',
        www: [
            {
                title: '情报',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
                source: ['/user/home'],
                target: '/hpoi/info/all',
            },
            {
                title: '所有周边',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
                source: ['/hobby/all'],
                target: '/hpoi/items/all',
            },
            {
                title: '角色周边',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
            },
            {
                title: '作品周边',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
            },
            {
                title: '热门推荐',
                docs: 'https://docs.rsshub.app/routes/anime#hpoi-shou-ban-wei-ji',
                source: ['/bannerItem/list'],
                target: '/hpoi/bannerItem',
            },
        ],
    },
};
