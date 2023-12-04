const radars = [
    {
        title: '衡阳日报',
        docs: 'https://docs.rsshub.app/routes/journal#heng-yang-quan-sou-suo-heng-yang-ri-bao',
        source: ['/'],
        target: '/hnrb/hyrb/:id?',
    },
    {
        title: '衡阳晚报',
        docs: 'https://docs.rsshub.app/routes/journal#heng-yang-quan-sou-suo-heng-yang-wan-bao',
        source: ['/'],
        target: '/hnrb/hywb/:id?',
    },
];

module.exports = {
    'hyqss.cn': {
        _name: '衡阳全搜索',
        '.': radars,
        epaper: radars,
    },
};
