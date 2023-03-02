module.exports = {
    'gaze.run': {
        _name: '注视影视',
        '.': [
            {
                title: '更新通知',
                docs: 'https://docs.rsshub.app//multimedia.html#gaze-run',
                source: ['/play/:mid'],
                target: (params) => `/gaze/update/${params.mid}`,
            },
        ],
    },
};
