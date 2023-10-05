module.exports = {
    'twitch.tv': {
        _name: 'Twitch',
        www: [
            {
                title: 'Channel',
                docs: 'https://docs.rsshub.app/routes/live#twitch-channel',
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
                        return '/twitch/channel/:login';
                    }
                },
            },
        ],
    },
};
