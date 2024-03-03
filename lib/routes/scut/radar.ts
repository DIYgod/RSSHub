export default {
    'scut.edu.cn': {
        _name: '华南理工大学',
        jw: [
            {
                title: '教务处通知公告',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
            },
            {
                title: '教务处学院通知',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
            },
            {
                title: '教务处新闻动态',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
            },
        ],
        www2: [
            {
                title: '电子与信息学院 - 新闻速递',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
                source: ['/ee/16285/list.htm'],
                target: '/scut/seie/news_center',
            },
            {
                title: '机械与汽车工程学院 - 通知公告',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
                source: ['/smae/:category/list.htm'],
                target: (params) => {
                    let tid;
                    switch (params.category) {
                        case '20616':
                            tid = 'gwxx';
                            break;
                        case '20617':
                            tid = 'djgz';
                            break;
                        case '20622':
                            tid = 'rsgz';
                            break;
                        case 'xsgz':
                            tid = 'xsgz';
                            break;
                        case '20618':
                            tid = 'kysys';
                            break;
                        case '20619':
                            tid = 'bksjw';
                            break;
                        case '20620':
                            tid = 'yjsjw';
                            break;
                        default:
                            return false;
                    }
                    return `/scut/smae/${tid}`;
                },
            },
            {
                title: '研究生院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#hua-nan-li-gong-da-xue',
                source: ['/graduate/14562/list.htm'],
                target: '/scut/yjs',
            },
        ],
    },
};
