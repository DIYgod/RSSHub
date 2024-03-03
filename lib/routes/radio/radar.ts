export default {
    'radio.cn': {
        _name: '云听',
        '.': [
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/routes/multimedia#yun-ting-zhuan-ji',
                source: ['/pc-portal/sanji/detail.html', '/share/albumDetail', '/'],
                target: (params, url) => `/radio/album/${new URL(url).searchParams.get('columnId')}`,
            },
            {
                title: '节目',
                docs: 'https://docs.rsshub.app/routes/multimedia#yun-ting-jie-mu',
                source: ['/pc-portal/sanji/detail.html', '/share/albumDetail', '/'],
                target: (params, url) => `/radio/${new URL(url).searchParams.get('columnId')}`,
            },
            {
                title: '直播',
                docs: 'https://docs.rsshub.app/routes/multimedia#yun-ting-zhi-bo',
                source: ['/pc-portal/sanji/zhibo_2.html', '/'],
                target: (params, url) => `/radio/zhibo/${new URL(url).searchParams.get('name')}`,
            },
        ],
    },
};
