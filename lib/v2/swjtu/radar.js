module.exports = {
    'swjtu.edu.cn': {
        _name: '西南交通大学',
        ctt: [
            {
                title: '交通运输与物流学院 - 研究生通知',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-jiao-tong-da-xue',
                source: ['/yethan/WebIndexAction', '/'],
                target: (_, url) => (new URL(url).searchParams.get('setAction') === 'newsList' && new URL(url).searchParams.get('bigTypeId') === '0E4BF4D36E232918' ? '/swjtu/jtys/yjs' : null),
            },
        ],
    },
};
