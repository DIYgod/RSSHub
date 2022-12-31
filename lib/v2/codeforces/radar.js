module.exports = {
    'codeforces.com': {
        _name: 'Codeforces',
        www: [
            {
                title: '最新比赛',
                docs: 'https://docs.rsshub.app/programming.html#codeforces-zui-xin-bi-sai',
                source: ['/contests'],
                target: '/codeforces/contests',
            },
        ],
        '.': [
            {
                // for codeforces.com
                title: 'User comments',
                docs: 'https://docs.rsshub.app/en/programming.html#codeforces-user-comments',
                source: 'comments/with/:user',
                target: () => '/codeforces/comments/:user',
            },
        ],
    },
};
