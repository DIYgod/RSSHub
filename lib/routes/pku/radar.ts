export default {
    'pku.edu.cn': {
        _name: '北京大学',
        admission: [
            {
                title: '硕士招生',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/zsxx/sszs/index.htm', '/'],
                target: '/pku/admission/sszs',
            },
        ],
        bbs: [
            {
                title: '北大未名 BBS 全站十大',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/v2/hot-topic.php', '/'],
                target: '/pku/bbs/hot',
            },
        ],
        bio: [
            {
                title: '生命科学学院近期讲座',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/homes/Index/news_jz/7/7.html', '/'],
                target: '/pku/cls/lecture',
            },
            {
                title: '生命科学学院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/homes/Index/news/21/21.html', '/'],
                target: '/pku/cls/announcement',
            },
        ],
        eecs: [
            {
                title: '信科公告通知',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/xygk1/ggtz/:type', '/xygk1/ggtz.htm', '/'],
                target: (params) => {
                    let type = params.type;
                    switch (type) {
                        case 'qb.htm':
                            type = 0;
                            break;
                        case 'xytz.htm':
                            type = 1;
                            break;
                        case 'rstz.htm':
                            type = 2;
                            break;
                        case 'jwtz.htm':
                            type = 6;
                            break;
                        case 'xgtz.htm':
                            type = 8;
                            break;
                        case 'kytz.htm':
                            type = 7;
                            break;
                        case 'cwtz.htm':
                            type = 5;
                            break;
                        case 'ghtz.htm':
                            type = 3;
                            break;
                        case 'yytz.htm':
                            type = 4;
                            break;
                        default:
                            type = 0;
                            break;
                    }
                    return `/pku/eecs/${type}`;
                },
            },
        ],
        hr: [
            {
                title: '人事处',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue-ren-shi-chu',
                source: ['/'],
                target: '/pku/hr/:category?',
            },
        ],
        nsd: [
            {
                title: '观点 - 北京大学国家发展研究院',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/'],
                target: '/pku/nsd/gd',
            },
        ],
        'www.rccp': [
            {
                title: '每周一推 - 中国政治学研究中心',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue-ren-shi-chu',
                source: ['/'],
                target: '/pku/rccp/mzyt',
            },
        ],
        scc: [
            {
                title: '学生就业指导服务中心',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue-ren-shi-chu',
                source: ['/*path'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'home!newsHome.action?category=12':
                            type = 'xwrd';
                            break;
                        case 'home!newsHome.action?category=13':
                            type = 'tzgg';
                            break;
                        case 'home!recruit.action?category=1&jobType=110001':
                            type = 'zpxx';
                            break;
                        case 'home!recruitList.action?category=1&jobType=110002':
                            type = 'gfjgxx';
                            break;
                        case 'home!recruitList.action?category=2':
                            type = 'sxxx';
                            break;
                        case 'home!newsHome.action?category=11':
                            type = 'cyxx';
                            break;
                        default:
                            type = 'zpxx';
                            break;
                    }
                    return `/pku/scc/recruit/${type}`;
                },
            },
        ],
        ss: [
            {
                title: '软微-通知公告',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/index.php/newscenter/notice', '/'],
                target: '/pku/ss/notice',
            },
            {
                title: '软微-招生通知',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/admission/admnotice', '/'],
                target: '/pku/ss/admission',
            },
            {
                title: '软微-硕士统考招生',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-da-xue',
                source: ['/admission/admbrochure/admission01', '/'],
                target: '/pku/ss/pgadmin',
            },
        ],
    },
};
