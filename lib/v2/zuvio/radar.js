module.exports = {
    'zuvio.com.tw': {
        _name: 'Zuvio',
        irs: [
            {
                title: '校園話題',
                docs: 'https://docs.rsshub.app/bbs.html#zuvio',
                source: ['/student5/chickenM/articles/:board', '/student5/chickenM/articles'],
                target: (params) => `/zuvio/student5${params.board ? `/${params.board}` : ''}`,
            },
        ],
    },
};
