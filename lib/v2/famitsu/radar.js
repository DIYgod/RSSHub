module.exports = {
    'famitsu.com': {
        _name: 'ファミ通',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/game.html#ファミ-tong',
                source: ['/search'],
                target: (_, url) => `/famitsu/category/${new URL(url).searchParams.get('category')}`,
            },
        ],
    },
};
