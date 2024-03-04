export default {
    'feng.com': {
        _name: '威锋',
        '.': [
            {
                title: '社区',
                docs: 'https://docs.rsshub.app/routes/bbs#wei-feng',
                source: ['/forum/photo/:id', '/forum/:id'],
                target: '/feng/forum/:id',
            },
        ],
    },
};
