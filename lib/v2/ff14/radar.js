const finalfantasyxiv = [
    {
        title: '国际服 （Lodestone）',
        docs: 'https://docs.rsshub.app/game.html#zui-zhong-huan-xiang-14',
        source: ['/lodestone/news', '/'],
        target: (_, url) => `/ff14/global/${url.match(/\/\/(\w+?)\.finalfantasyxiv\.com/)[1]}`,
    },
];

module.exports = {
    'finalfantasyxiv.com': {
        _name: '最终幻想 14',
        eu: finalfantasyxiv,
        fr: finalfantasyxiv,
        de: finalfantasyxiv,
        jp: finalfantasyxiv,
        na: finalfantasyxiv,
    },
    'sdo.com': {
        _name: '最终幻想 14',
        'ff.web': [
            {
                title: '国服',
                docs: 'https://docs.rsshub.app/game.html#zui-zhong-huan-xiang-14',
                source: ['/web8/index.html'],
                target: '/ff14/zh',
            },
        ],
    },
};
