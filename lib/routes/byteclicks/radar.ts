export default {
    'byteclicks.com': {
        _name: '字节点击',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#zi-jie-dian-ji',
                source: ['/'],
                target: '/byteclicks',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#zi-jie-dian-ji',
                source: ['/tag/:tag'],
                target: '/byteclicks/tag/:tag',
            },
        ],
    },
};
