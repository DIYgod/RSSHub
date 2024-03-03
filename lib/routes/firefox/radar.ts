export default {
    'firefox.com': {
        _name: 'Mozilla',
        monitor: [
            {
                title: 'Firefox Monitor',
                docs: 'https://docs.rsshub.app/routes/other#mozilla',
                source: ['/', '/breaches'],
                target: '/firefox/breaches',
            },
        ],
    },
    'mozilla.org': {
        _name: 'Mozilla',
        addons: [
            {
                title: 'Add-ons Update',
                docs: 'https://docs.rsshub.app/routes/program-update#firefox',
                source: ['/:lang/firefox/addon/:id/versions', '/:lang/firefox/addon/:id'],
                target: '/firefox/addons/:id',
            },
        ],
        '.': [
            {
                title: 'Firefox New Release',
                docs: 'https://docs.rsshub.app/routes/program-update#firefox',
            },
        ],
    },
};
