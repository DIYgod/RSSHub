export default {
    'qq88.info': {
        _name: '秋爸日字',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/multimedia#qiu-ba-ri-zi',
                source: '/',
                target: (_params, url) => (new URL(url).searchParams.get('cat') ? `/qq88/${new URL(url).searchParams.get('cat')}` : '/qq88'),
            },
        ],
    },
};
