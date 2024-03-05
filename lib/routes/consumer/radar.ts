export default {
    'consumer.org.hk': {
        _name: '消费者委员会',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/routes/new-media#xiao-fei-zhe-wei-yuan-hui-wen-zhang',
                source: ['/'],
                target: '/consumer/:category?/:language?/:keyword?',
            },
            {
                title: '消費全攻略',
                docs: 'https://docs.rsshub.app/routes/new-media#xiao-fei-zhe-wei-yuan-hui',
                source: ['/:language/shopping-guide/:category'],
                target: '/consumer/shopping-guide/:category/:language',
            },
        ],
    },
};
