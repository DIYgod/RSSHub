module.exports = {
    'qq88.info': {
        _name: '秋爸日字',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#qiu-ba-ri-zi',
                source: '/',
                target: (_params, url) => (new URL(url).searchParams.get('cat') ? `/qq88/${new URL(url).searchParams.get('cat')}` : '/qq88'),
            },
        ],
    },
};
