export default {
    'apache.org': {
        _name: 'Apache',
        apisix: [
            {
                title: 'APISIX 博客',
                docs: 'https://docs.rsshub.app/routes/blog#apache',
                source: ['/zh/blog'],
                target: () => '/apache/apisix/blog',
            },
        ],
    },
};
