export default {
    'iyingdi.com': {
        _name: '旅法师营地',
        www: [
            {
                title: '分区',
                docs: 'https://docs.rsshub.app/routes/game#lv-fa-shi-ying-di',
                source: ['/tz/tag/:tagId'],
                target: '/lfsyd/tag/:tagId',
            },
            {
                title: '用户发帖',
                docs: 'https://docs.rsshub.app/routes/game#lv-fa-shi-ying-di',
                source: ['/tz/people/:id', '/tz/people/:id/*'],
                target: '/lfsyd/user/:id',
            },
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/game#lv-fa-shi-ying-di',
                source: ['/'],
                target: '/lfsyd/home',
            },
            {
                title: '首页（旧版）',
                docs: 'https://docs.rsshub.app/routes/game#lv-fa-shi-ying-di',
                source: ['/'],
                target: '/lfsyd/old_home',
            },
        ],
        mob: [
            {
                title: '分区（mob）',
                docs: 'https://docs.rsshub.app/routes/game#lv-fa-shi-ying-di',
                source: ['/fine/:tagId'],
                target: '/lfsyd/tag/:tagId',
            },
        ],
    },
};
