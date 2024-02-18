module.exports = {
    'indienova.com': {
        _name: 'indienova 独立游戏',
        '.': [
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/game##indienova-du-li-you-xi',
                source: ['/column/:columnId'],
                target: '/indienova/column/:columnId',
            },
            {
                title: 'GameDB 游戏库',
                docs: 'https://docs.rsshub.app/routes/game##indienova-du-li-you-xi',
                source: ['/gamedb/recent/:platform/p/1'],
                target: '/indienova/gamedb/recent/:platform',
            },
            {
                title: '会员开发游戏库',
                docs: 'https://docs.rsshub.app/routes/game##indienova-du-li-you-xi',
                source: ['/usergames', '/'],
                target: '/indienova/usergames',
            },
        ],
    },
};
