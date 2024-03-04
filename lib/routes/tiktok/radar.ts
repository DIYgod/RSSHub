export default {
    'tiktok.com': {
        _name: 'TikTok',
        '.': [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/social-media#tiktok',
                source: ['/:user'],
                target: '/tiktok/user/:user',
            },
        ],
    },
};
