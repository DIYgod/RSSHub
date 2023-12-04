module.exports = {
    'oo-software.com': {
        _name: 'O&O Software',
        '.': [
            {
                title: 'Changelog',
                docs: 'https://docs.rsshub.app/routes/program-update#oo-software-changelog',
                source: ['/en/changelog'],
                target: (params, url) => `/oo-software/changelog/${new URL(url).match(/\/en\/(.*?)\/changelog/)[1]}`,
            },
        ],
    },
};
