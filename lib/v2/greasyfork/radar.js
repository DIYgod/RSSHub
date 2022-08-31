module.exports = {
    'greasyfork.org': {
        _name: 'Greasy Fork',
        '.': [
            {
                title: 'User scripts',
                docs: 'https://docs.rsshub.app/program-update.html#greasy-fork',
                source: ['/:language', '/:language/scripts/by-site/:domain?'],
                target: '/greasyfork/:language/:domain?',
            },
            {
                title: 'Version history',
                docs: 'https://docs.rsshub.app/program-update.html#greasy-fork',
                source: '/:language/scripts/:script/versions',
                target: '/greasyfork/:language/:script/versions',
            },
        ],
    },
};
