export default {
    '52hrtt.com': {
        _name: '52hrtt 华人头条',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#52hrtt-hua-ren-tou-tiao',
                source: '/',
                target: (_params, url) => `/52hrtt/${new URL(url).searchParams.get('infoTypeId')}`,
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#52hrtt-hua-ren-tou-tiao',
                source: '/global/n/w/symposium/:id',
                target: '/52hrtt/symposium/:id',
            },
        ],
    },
};
