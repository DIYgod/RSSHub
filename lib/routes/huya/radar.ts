export default {
    'huya.com': {
        _name: '虎牙直播',
        '.': [
            {
                title: '直播间开播',
                docs: 'https://docs.rsshub.app/live.html#hu-ya-zhi-bo',
                source: ['/:id', '/'],
                target: '/huya/room/:id',
            },
        ],
    },
};
