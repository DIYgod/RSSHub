export default {
    'x6d.com': {
        _name: '小刀娱乐网',
        xd: [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/new-media#xiao-dao-yu-le-wang',
                source: ['/html/:id'],
                target: (params) => `/x6d/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
