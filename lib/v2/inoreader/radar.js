module.exports = {
    'inoreader.com': {
        _name: 'Inoreader',
        '.': [
            {
                title: 'HTML Clip',
                docs: 'https://docs.rsshub.app/reading.html#inoreader',
                source: ['/stream/user/:user/tag/:tag/view/html?n=:num'],
                target: '/html_clip/:user/:tag/:num?',
            },
        ],
    },
};
