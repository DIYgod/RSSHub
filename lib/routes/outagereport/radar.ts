export default {
    'outage.report': {
        _name: 'Outage.Report',
        '.': [
            {
                title: 'Report',
                docs: 'https://docs.rsshub.app/routes/forecast#outage-report',
                source: ['/'],
                target: (params, url) => `/outagereport/${new URL(url).toString().split('/').pop()}`,
            },
        ],
    },
};
