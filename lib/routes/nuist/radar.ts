export default {
    'nuist.edu.cn': {
        _name: '南京信息工程大学',
        bulletin: [
            {
                title: '信息公告栏',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/:category/list.htm'],
                target: '/nuist/bulletin/:category',
            },
        ],
        cas: [
            {
                title: '大气科学学院',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/index/:category'],
                target: (params) => `/nuist/cas/${params.category.replace('.htm', '')}`,
            },
        ],
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/index/:category', '/xxtz/:category'],
                target: (params) => `/nuist/jwc/${params.category.replace('.htm', '')}`,
            },
        ],
        lib: [
            {
                title: '图书馆',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/', '/index/tzgg.htm'],
                target: '/nuist/lib',
            },
        ],
        scs: [
            {
                title: '计软院',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/:category/list.htm'],
                target: '/nuist/scs/:category',
            },
        ],
        sese: [
            {
                title: '环科院',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/:category'],
                target: (params) => `/nuist/sese/${params.category.replace('.htm', '')}`,
            },
        ],
        xgc: [
            {
                title: '学生工作处',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/', '/419/list.htm'],
                target: '/nuist/xgc',
            },
        ],
        yjs: [
            {
                title: '研究生院学科建设处',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-xin-xi-gong-cheng-da-xue',
                source: ['/'],
                target: '/nuist/jwc/:path+',
            },
        ],
    },
};
