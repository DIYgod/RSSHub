module.exports = {
    'modb.pro': {
        _name: '墨天轮',
        '.': [
            {
                title: '合辑',
                docs: 'https://docs.rsshub.app/routes/new-media#mo-tian-lun',
                source: ['/', '/topic/:id'],
                target: (params) => `/modb/topic/${params.id}`,
            },
        ],
    },
};
