module.exports = {
    'chaping.cn': {
        _name: '差评',
        '.': [
            {
                title: '图片墙',
                docs: 'https://docs.rsshub.app/new-media.html#cha-ping',
                source: ['/'],
                target: '/chaping/banner',
            },
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#cha-ping',
                source: ['/news'],
                target: (params, url) => {
                    const cateList = ['15', '3', '7', '5', '6', '1', '8', '9'];
                    const cate = new URL(url).searchParams.get('cate');
                    if (cateList.includes(cate)) {
                        return `/chaping/news/${cate}`;
                    }
                },
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#cha-ping',
                source: ['/newsflash'],
                target: '/chaping/newsflash',
            },
        ],
    },
};
