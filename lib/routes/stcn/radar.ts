export default {
    'stcn.com': {
        _name: '证券时报网',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/finance#zheng-quan-shi-bao-wang-lan-mu',
                source: ['/'],
                target: (params, url) => `/stcn/${new URL(url).toString().match(/article\/list\/(.*)\.html/)[1]}`,
            },
        ],
    },
};
