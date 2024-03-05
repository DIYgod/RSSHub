const radarConfig = {
    _name: '联合早报',
    www: [
        {
            title: '新闻-新加坡',
            docs: 'https://docs.rsshub.app/routes/traditional-media#lian-he-zao-bao-xin-wen',
            source: ['/', '/news', '/news/singapore'],
            target: '/zaobao/znews/singapore',
        },
        {
            title: '新闻-中国',
            docs: 'https://docs.rsshub.app/routes/traditional-media#lian-he-zao-bao-xin-wen',
            source: ['/', '/news', '/news/china'],
            target: '/zaobao/znews/china',
        },
        {
            title: '新闻-国际',
            docs: 'https://docs.rsshub.app/routes/traditional-media#lian-he-zao-bao-xin-wen',
            source: ['/', '/news', '/news/world'],
            target: '/zaobao/znews/world',
        },
    ],
};

export default {
    'zaobao.com': radarConfig,
    'zaobao.com.sg': radarConfig,
};
