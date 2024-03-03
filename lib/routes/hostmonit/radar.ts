export default {
    'hostmonit.com': {
        _name: '全球主机监控',
        stock: [
            {
                title: 'CloudFlareYes',
                docs: 'https://docs.rsshub.app/routes/other#quan-qiu-zhu-ji-jian-kong-cloudflareyes',
                source: ['/:type'],
                target: (params) => {
                    const type = params.type;

                    return `/hostmonit/${type}`;
                },
            },
        ],
    },
};
