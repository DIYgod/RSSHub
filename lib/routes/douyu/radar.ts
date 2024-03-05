export default {
    'douyu.com': {
        _name: '斗鱼',
        www: [
            {
                title: '直播间开播',
                docs: 'https://docs.rsshub.app/routes/live#dou-yu-zhi-bo-zhi-bo-jian-kai-bo',
                source: ['/:id', '/'],
                target: '/douyu/room/:id',
            },
        ],
        yuba: [
            {
                title: '鱼吧帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#dou-yu-yu-ba-tie-zi',
                source: ['/group/:id', '/group/newself/:id', '/group/newall/:id', '/'],
                target: '/douyu/group/:id',
            },
            {
                title: '鱼吧跟帖',
                docs: 'https://docs.rsshub.app/routes/bbs#dou-yu-yu-ba-gen-tie',
                source: ['/p/:id', '/'],
                target: '/douyu/post/:id',
            },
        ],
    },
};
