module.exports = {
    '0818tuan.com': {
        _name: '0818 团',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/shopping.html#_0818-tuan',
                source: ['/:listId', '/'],
                target: (params) => `/0818tuan${params.listId ? '/' + params.listId.replace('list-', '').replace('-0.html', '') : ''}`,
            },
        ],
    },
};
