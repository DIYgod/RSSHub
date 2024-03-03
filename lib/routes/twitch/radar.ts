export default {
    'twitch.tv': {
        _name: 'Twitch',
        www: [
            {
                title: 'Live',
                docs: 'https://docs.rsshub.app/routes/live#twitch-live',
                source: '/:login',
                target: (params) => {
                    if (
                        params.login !== 'directory' &&
                        params.login !== 'downloads' &&
                        params.login !== 'store' &&
                        params.login !== 'turbo' &&
                        params.login !== 'search' &&
                        params.login !== 'subscriptions' &&
                        params.login !== 'wallet'
                    ) {
                        return '/twitch/live/:login';
                    }
                },
            },
            {
                title: 'Channel Video',
                docs: 'https://docs.rsshub.app/routes/live#twitch-channel-video',
                source: '/:login/videos',
                target: '/twitch/video/:login',
            },
            {
                title: 'Stream Schedule',
                docs: 'https://docs.rsshub.app/routes/live#twitch-stream-schedule',
                source: '/:login/schedule',
                target: '/twitch/schedule/:login',
            },
        ],
    },
};
