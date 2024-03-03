export default {
    'famitsu.com': {
        _name: 'ファミ通',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/game#ファミ-tong',
                source: ['/search'],
                target: (_, url) => `/famitsu/category/${new URL(url).searchParams.get('category')}`,
            },
        ],
    },
};
