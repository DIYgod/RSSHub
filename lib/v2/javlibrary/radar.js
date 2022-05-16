module.exports = {
    'javlibrary.com': {
        _name: 'JAVLibrary',
        '.': [
            {
                title: '最近讨论的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#zui-jin-tao-lun-de-ying-pian',
                source: ['/:language', '/'],
                target: (params) => `/javlibrary/update/${params.language}`,
            },
            {
                title: '新发行的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#xin-fa-xing-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/newrelease/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '最新加入的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#zui-xin-jia-ru-de-ying-pian',
                source: ['/:language', '/'],
                target: (params) => `/javlibrary/update/${params.language}`,
            },
            {
                title: '最想要的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#zui-xiang-yao-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/mostwanted/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '评价最高的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#ping-jia-zui-gao-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/bestrated/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '最佳评论',
                docs: 'https://docs.rsshub.app/multimedia.html#zui-jia-ping-lun',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/bestreviews/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '影片依分类',
                docs: 'https://docs.rsshub.app/multimedia.html#ying-pian-yi-fen-lei',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/genre/${new URL(url).searchParams.get('g')}/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '影片按演员',
                docs: 'https://docs.rsshub.app/multimedia.html#ying-pian-an-yan-yuan',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/star/${new URL(url).searchParams.get('s')}/${params.language}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '用户发表的文章',
                docs: 'https://docs.rsshub.app/multimedia.html#yong-hu-fa-biao-de-wen-zhang',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/userposts/${new URL(url).searchParams.get('u')}/${params.language}`,
            },
            {
                title: '用户想要的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#yong-hu-xiang-yao-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/userwanted/${new URL(url).searchParams.get('u')}/${params.language}`,
            },
            {
                title: '用户看过的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#yong-hu-kan-guo-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/userwatched/${new URL(url).searchParams.get('u')}/${params.language}`,
            },
            {
                title: '用户拥有的影片',
                docs: 'https://docs.rsshub.app/multimedia.html#yong-hu-yong-you-de-ying-pian',
                source: ['/:language', '/'],
                target: (params, url) => `/javlibrary/userowned/${new URL(url).searchParams.get('u')}/${params.language}`,
            },
        ],
    },
};
