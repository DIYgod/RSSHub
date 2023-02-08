const bdys = {
    _name: '哔嘀影视',
    '.': [
        {
            title: '首页',
            docs: 'https://docs.rsshub.app/multimedia.html#bi-di-ying-shi',
            source: ['/s/:caty'],
            target: (params, url) => {
                const searchParams = new URL(url).searchParams;
                return `/bdys/${params.caty}/${searchParams.get('type') || 'all'}/${searchParams.get('area') || 'all'}/${searchParams.get('year') || 'all'}/${searchParams.get('order') || '0'}`;
            },
        },
    ],
};

module.exports = {
    '52bdys.com': bdys,
    'bde4.icu': bdys,
    'bdys01.com': bdys,
};
