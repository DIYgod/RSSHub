module.exports = {
    'gaze.run': {
        _name: 'gaze.run',
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
