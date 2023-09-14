module.exports = {
    'gamegene.cn/': {
        _name: '游戏基因 GameGene',
        news: [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/game#gamegene-zi-xun',
                source: ['/news'],
                target: () => `/news`,
            },
        ],
    },
};
