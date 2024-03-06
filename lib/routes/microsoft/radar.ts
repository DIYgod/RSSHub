export default {
    'microsoft.com': {
        _name: 'Microsoft',
        microsoftedge: [
            {
                title: 'Addon Update',
                source: '/addons/detail/:name/:crxid',
                docs: 'https://docs.rsshub.app/routes/program-update#microsoft-edge',
                target: '/microsoft/edge/addon/:crxid',
            },
        ],
    },
};
