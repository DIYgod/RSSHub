module.exports = {
    'njit.edu.cn': {
        _name: '南京工程学院',
        jwc: [
            {
                title: '南京工程学院教务处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-gong-cheng-xue-yuan-nan-jing-gong-cheng-xue-yuan-jiao-wu-chu',
                source: '/index/:type',
                target: (params) => `/njit/jwc/${params.type.replace('.htm', '')}`,
            },
        ],
        www: [
            {
                title: '南京工程学院通知公告',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-gong-cheng-xue-yuan-nan-jing-gong-cheng-xue-yuan-tong-zhi-gong-gao',
                source: '/',
                target: '/njit/tzgg',
            },
        ],
    },
};
