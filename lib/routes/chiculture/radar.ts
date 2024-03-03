export default {
    'chiculture.org.hk': {
        _name: '通識・現代中國',
        '.': [
            {
                title: '議題熱話',
                docs: 'https://docs.rsshub.app/routes/new-media#tong-shi-・-xian-dai-zhong-guo',
                source: ['/tc/hot-topics'],
                target: (_, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/chiculture${searchParams.has('category') ? `/${searchParams.get('category')}` : ''}`;
                },
            },
        ],
    },
};
