export default {
    'sohu.com': {
        _name: '搜狐',
        '.': [
            {
                title: '搜狐号',
                docs: 'https://docs.rsshub.app/routes/new-media#sou-hu-hao',
                source: ['/a/:id'],
                target: (params) => `/sohu/mp/${params.id.split('_')[1]}`,
            },
        ],
    },
};
