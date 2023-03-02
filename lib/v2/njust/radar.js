module.exports = {
    'njust.edu.cn': {
        _name: '南京理工大学',
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-li-gong-da-xue',
                source: ['/:type/list.htm'],
                target: (params) => {
                    let type = '';
                    switch (params.type) {
                        case '1216':
                            type = 'jstz';
                            break;
                        case '1217':
                            type = 'xstz';
                            break;
                        case '1218':
                            type = 'xw';
                            break;
                        case '1219':
                            type = 'xydt';
                            break;
                        default:
                            return;
                    }
                    return `/njust/jwc/${type}`;
                },
            },
        ],
        cwc: [
            {
                title: '财务处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-li-gong-da-xue',
                source: ['/:type/list.htm'],
                target: (params) => {
                    let type = '';
                    switch (params.type) {
                        case '12432':
                            type = 'tzgg';
                            break;
                        case '1382':
                            type = 'bslc';
                            break;
                        default:
                            return;
                    }
                    return `/njust/cwc/${type}`;
                },
            },
        ],
        gs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-li-gong-da-xue',
                source: ['/:type/list.htm'],
                target: `/njust/gs/:type`,
            },
        ],
        eoe: [
            {
                title: '电光学院',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-li-gong-da-xue',
                source: ['/:type/list.htm'],
                target: (params) => {
                    let type = '';
                    switch (params.type) {
                        case '1920':
                            type = 'tzgg';
                            break;
                        case '1919':
                            type = 'xwdt';
                            break;
                        default:
                            return;
                    }
                    return `/njust/eoe/${type}`;
                },
            },
        ],
        dgxg: [
            {
                title: '电光学院研学网/年级网站',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-li-gong-da-xue',
                source: ['/:type/list.htm', '/:grade/:type/list.htm'],
                target: (params) => {
                    if (!params.grade) {
                        let type = '';
                        switch (params.type) {
                            case '6509':
                                type = 'gstz';
                                break;
                            case '6511':
                                type = 'xswh';
                                break;
                            case '6510':
                                type = 'jyzd';
                                break;
                            default:
                                return;
                        }
                        return `/njust/dgxg/${type}`;
                    } else {
                        return `/njust/eo/${params.grade}/${params.type}`;
                    }
                },
            },
        ],
    },
};
