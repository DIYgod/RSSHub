module.exports = {
    'twitter.com': {
        _name: 'Twitter',
        '.': [
            {
                title: '用户时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/user/:id';
                    }
                },
            },
            {
                title: '用户媒体时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id/media',
                target: (params) => {
                    if (!['home', 'explore', 'notifications', 'messages', 'explore', 'search'].includes(params.id)) {
                        return '/twitter/media/:id';
                    }
                },
            },
            {
                title: '用户关注时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/followings/:id';
                    }
                },
            },
            {
                title: '用户喜欢列表',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/likes/:id';
                    }
                },
            },
            {
                title: '列表时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id/lists/:name',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/list/:id/:name';
                    }
                },
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/search',
                target: (params, url) => `/twitter/keyword/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
};
