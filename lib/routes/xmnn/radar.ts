export default {
    'xmnn.cn': {
        _name: '厦门网',
        epaper: [
            {
                title: '数字媒体',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-shu-zi-mei-ti',
                source: ['/:id'],
                target: '/xmnn/epaper/:id',
            },
        ],
        news: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/:category*'],
                target: (params) => {
                    const category = params.category;

                    return `/xmnn/news/${category ? `/${category}` : ''}`;
                },
            },
            {
                title: '厦门新闻发布',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/xmxwfb'],
                target: '/xmnn/news/xmxwfb',
            },
            {
                title: '厦门新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/xmxw'],
                target: '/xmnn/news/xmxw',
            },
            {
                title: '本网快报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/bwkb'],
                target: '/xmnn/news/bwkb',
            },
            {
                title: '厦门网眼',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/xmwy'],
                target: '/xmnn/news/xmwy',
            },
            {
                title: '福建新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/fjxw'],
                target: '/xmnn/news/fjxw',
            },
            {
                title: '国内新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/gnxw'],
                target: '/xmnn/news/gnxw',
            },
            {
                title: '国际新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/gjxw'],
                target: '/xmnn/news/gjxw',
            },
            {
                title: '台海新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/thxw'],
                target: '/xmnn/news/thxw',
            },
            {
                title: '社会新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#xia-men-wang-xin-wen',
                source: ['/shxw'],
                target: '/xmnn/news/shxw',
            },
        ],
    },
};
