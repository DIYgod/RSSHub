module.exports = {
    'hdu.edu.cn': {
        _name: '杭州电子科技大学',
        computer: [
            {
                title: '计算机学院 - 通知公告',
                docs: 'https://docs.rsshub.app/routes/university#hang-zhou-dian-zi-ke-ji-da-xue',
                source: '/6738/list.htm',
                target: '/hdu/cs',
            },
            {
                title: '杭电计算机-研究生通知',
                docs: 'https://docs.rsshub.app/routes/university#hang-zhou-dian-zi-ke-ji-da-xue',
                source: '/6769/list.htm',
                target: '/hdu/cs/pg',
            },
        ],
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#hang-zhou-dian-zi-ke-ji-da-xue',
                source: '/',
                target: '/hdu/jwc/:category',
            },
        ],
        grs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#hang-zhou-dian-zi-ke-ji-da-xue',
                source: '/',
                target: '/hdu/grs/:category',
            },
        ],
    },
};
