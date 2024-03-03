export default {
    'mittrchina.com': {
        _name: '麻省理工科技评论',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#ma-sheng-li-gong-ke-ji-ping-lun',
                source: ['/', '/news'],
                target: '/mittrchina/index',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/routes/new-media#ma-sheng-li-gong-ke-ji-ping-lun',
                source: ['/', '/breaking'],
                target: '/mittrchina/breaking',
            },
            {
                title: '本周热文',
                docs: 'https://docs.rsshub.app/routes/new-media#ma-sheng-li-gong-ke-ji-ping-lun',
                source: ['/'],
                target: '/mittrchina/hot',
            },
            {
                title: '视频',
                docs: 'https://docs.rsshub.app/routes/new-media#ma-sheng-li-gong-ke-ji-ping-lun',
                source: ['/', '/video'],
                target: '/mittrchina/video',
            },
        ],
    },
};
