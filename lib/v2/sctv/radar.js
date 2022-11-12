module.exports = {
    'sctv.com': {
        _name: '四川广播电视台',
        '.': [
            {
                title: '电视回放',
                docs: 'https://docs.rsshub.app/traditional-media.html#si-chuan-guang-bo-dian-shi-tai-dian-shi-hui-fang',
                source: ['/column/list', '/column/detail', '/'],
                target: (params, url) => `/sctv/programme/${new URL(url).searchParams.get('programmeId')}`,
            },
        ],
    },
};
