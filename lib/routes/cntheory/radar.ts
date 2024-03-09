export default {
    'cntheory.com': {
        _name: '理论网',
        paper: [
            {
                title: '学习时报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#li-lun-wang-xue-xi-shi-bao',
                source: ['/'],
                target: (params, url) => `/cntheory/paper/${new URL(url).toString().match(/-(\w+)\.htm/)[1]}`,
            },
        ],
    },
};
