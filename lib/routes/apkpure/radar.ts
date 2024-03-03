export default {
    'apkpure.com': {
        _name: 'APKPure',
        '.': [
            {
                title: '所有版本',
                docs: 'https://docs.rsshub.app/routes/program-update#apkpure',
                source: ['/:region/:stuff/:pkg/versions', '/:stuff/:pkg/versions', '/:stuff/:pkg'],
                target: (params) => `/apkpure/versions/${params.pkg}${params.region ? `/${params.region}` : ''}`,
            },
        ],
    },
};
