module.exports = {
    'xjtu.edu.cn': {
        _name: '西安交通大学',
        dean: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/university.html#xi-an-jiao-tong-da-xue-jiao-wu-chu',
                source: ['/'],
                target: '/xjtu/dean/:subpath+',
            },
        ],
        ee: [
            {
                title: '电气学院',
                docs: 'https://docs.rsshub.app/university.html#xi-an-jiao-tong-da-xue-dian-qi-xue-yuan',
                source: ['/'],
                target: '/xjtu/ee/:id?',
            },
        ],
        gs: [
            {
                title: '研究生院通知公告',
                docs: 'https://docs.rsshub.app/university.html#xi-an-jiao-tong-da-xue-yan-jiu-sheng-xue-yuan-tong-zhi-gong-gao',
                source: ['/'],
                target: '/xjtu/gs/tzgg',
            },
        ],
        international: [
            {
                title: '国际处通知',
                docs: 'https://docs.rsshub.app/university.html#xi-an-jiao-tong-da-xue-guo-ji-chu-tong-zhi',
                source: ['/'],
                target: '/xjtu/international/:subpath+',
            },
        ],
        std: [
            {
                title: '科技在线',
                docs: 'https://docs.rsshub.app/university.html#xi-an-jiao-tong-da-xue-ke-ji-zai-xian',
                source: ['/tzgg/:category', '/'],
                target: (params, url) => `/xjtu/std/${new URL(url).toString().match(/\/(\w+)\.htm/)[1]}`,
            },
        ],
    },
};
