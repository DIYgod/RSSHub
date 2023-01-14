module.exports = {
    'zaozao.run': {
        _name: '前端早早聊',
        www: [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/programming.html#qian-duan-zao-zao-liao',
                source: ['/article/:type'],
                target: '/zaozao/article/:type',
            },
        ],
    },
};
