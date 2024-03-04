export default {
    'dongqiudi.com': {
        _name: '懂球帝',
        m: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/home/:id'],
                target: '/dongqiudi/top_news/:id',
            },
        ],
        www: [
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/special/:id'],
                target: '/dongqiudi/special/:id',
            },
            {
                title: '早报',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/special/48'],
                target: '/dongqiudi/daily',
            },
            {
                title: '足球赛果',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/team/*team'],
                target: (params) => `/dongqiudi/result/${params.team.replace('.html', '')}`,
            },
            {
                title: '球队新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/team/*team'],
                target: (params) => `/dongqiudi/team_news/${params.team.replace('.html', '')}`,
            },
            {
                title: '球员新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#dong-qiu-di',
                source: ['/player/*id'],
                target: (params) => `/dongqiudi/player_news/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
