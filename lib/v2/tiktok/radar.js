module.exports = {
    'tiktok.com': {
        _name: 'TikTok',
        '.': [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/en/social-media#tiktok',
                source: ['/:user'],
                target: '/tiktok/user/:user',
            },
        ],
    },
};
