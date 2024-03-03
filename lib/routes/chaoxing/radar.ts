export default {
    'chaoxing.com': {
        _name: '超星',
        '.': [
            {
                title: '期刊',
                docs: 'https://docs.rsshub.app/routes/reading#chao-xing-qi-kan',
                source: ['/'],
                target: (params, url) => `/chaoxing/qk/${new URL(url).searchParams.get('mags')}`,
            },
        ],
    },
};
