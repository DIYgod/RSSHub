module.exports = {
    'outage.report': {
        _name: 'Outage.Report',
        '.': [
            {
                title: 'Report',
                docs: 'https://docs.rsshub.app/forecast.html#outage-report',
                source: ['/'],
                target: (params, url) => `/outagereport/${new URL(url).toString().split('/').pop()}`,
            },
        ],
    },
};
