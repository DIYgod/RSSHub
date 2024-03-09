export default {
    'mysql.com': {
        _name: 'MySQL',
        dev: [
            {
                title: 'Release Notes',
                docs: 'https://docs.rsshub.app/routes/programming#mysql-release-notes',
                source: ['/'],
                target: (params, url) => `/mysql/release/${new URL(url).toString().match(/\/mysql\/(.*?)\//)[1]}`,
            },
        ],
    },
};
