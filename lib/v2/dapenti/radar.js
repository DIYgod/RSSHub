module.exports = {
    'dapenti.com': {
        _name: '喷嚏',
        '.': [
            {
                title: '图卦',
                docs: 'https://docs.rsshub.app/picture.html#pen-ti',
                source: ['/blog/blog.asp'],
                target: (params, url) => {
                    if (new URL(url).searchParams.get('subjectid') === '70') {
                        return '/dapenti/tugua';
                    }
                },
            },
            {
                title: '主题',
                docs: 'https://docs.rsshub.app/picture.html#pen-ti',
                source: ['/blog/blog.asp'],
                target: (params, url) => {
                    if (new URL(url).searchParams.get('subjectid')) {
                        return '/dapenti/subject/' + new URL(url).searchParams.get('subjectid');
                    }
                },
            },
        ],
    },
};
