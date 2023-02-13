module.exports = {
    'x6d.com': {
        _name: '小刀娱乐网',
        xd: [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/new-media.html#xiao-dao-yu-le-wang',
                source: ['/html/:id'],
                target: (params) => `/x6d/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
