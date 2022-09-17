module.exports = {
    'secrss.com': {
        _name: '安全内参',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/programming.html#an-quan-nei-can',
                source: ['/articles', '/'],
                target: (_, url) => `/secrss/category${new URL(url).searchParams.has('tag') ? `/${new URL(url).searchParams.get('tag')}` : ''}`,
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/programming.html#an-quan-nei-can',
                source: ['/articles', '/'],
                target: (_, url) => `/secrss/author${new URL(url).searchParams.get('author')}`,
            },
        ],
    },
};
