export default {
    'sctv.com': {
        _name: '四川广播电视台',
        '.': [
            {
                title: '电视回放',
                docs: 'https://docs.rsshub.app/routes/traditional-media#si-chuan-guang-bo-dian-shi-tai-dian-shi-hui-fang',
                source: ['/column/list', '/column/detail', '/'],
                target: (params, url) => `/sctv/programme/${new URL(url).searchParams.get('programmeId')}`,
            },
        ],
    },
};
