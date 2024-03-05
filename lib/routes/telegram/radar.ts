export default {
    't.me': {
        _name: 'Telegram',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/social-media#telegram',
                source: '/:username',
                target: (params, url, document) => {
                    if (document?.querySelector('a[href^="/s/"]')) {
                        return '/telegram/channel/:username';
                    }
                },
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/social-media#telegram',
                source: '/s/:username',
                target: '/telegram/channel/:username',
            },
        ],
    },
    'telegram.org': {
        _name: 'Telegram',
        '.': [
            {
                title: 'Telegram Blog',
                docs: 'https://docs.rsshub.app/routes/social-media#telegram-telegram-blog',
                source: '/blog',
                target: '/telegram/blog',
            },
        ],
    },
};
