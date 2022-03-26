module.exports = {
    'appcenter.ms': {
        _name: 'App Center',
        install: [
            {
                title: 'App Center Release',
                docs: 'https://docs.rsshub.app/program-update.html#app-center',
                source: ['/users/:user/apps/:app/distribution_groups/:distribution_group', '/orgs/:user/apps/:app/distribution_groups/:distribution_group'],
                target: '/app-center/release/:user/:app/:distribution_group',
            },
        ],
    },
};
