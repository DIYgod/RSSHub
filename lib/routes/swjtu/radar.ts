export default {
    'swjtu.edu.cn': {
        _name: '西南交通大学',
        ctt: [
            {
                title: '交通运输与物流学院 - 研究生通知',
                docs: 'https://docs.rsshub.app/routes/university#xi-nan-jiao-tong-da-xue',
                source: ['/yethan/WebIndexAction', '/'],
                target: (_, url) => (new URL(url).searchParams.get('setAction') === 'newsList' && new URL(url).searchParams.get('bigTypeId') === '0E4BF4D36E232918' ? '/swjtu/jtys/yjs' : null),
            },
        ],
        jiuye: [
            {
                title: '就业招聘信息',
                docs: 'https://docs.rsshub.app/routes/university#xi-nan-jiao-tong-da-xue',
                source: ['/career', '/'],
                target: '/swjtu/jyzpxx',
            },
        ],
        jwc: [
            {
                title: '教务处通知',
                docs: 'https://docs.rsshub.app/routes/university#xi-nan-jiao-tong-da-xue',
                source: ['/vatuu/WebAction', '/'],
                target: '/swjtu/jwc',
            },
        ],
        xg: [
            {
                title: '扬华素质网',
                docs: 'https://docs.rsshub.app/routes/university#xi-nan-jiao-tong-da-xue',
                source: ['/web/Home/PushNewsList', '/web/Home/NewsList', '/web/Home/ColourfulCollegeNewsList', '/web/Publicity/List', '/'],
                target: '/swjtu/xg',
            },
        ],
    },
};
