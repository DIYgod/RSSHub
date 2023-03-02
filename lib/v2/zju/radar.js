module.exports = {
    'zju.edu.cn': {
        _name: '浙江大学',
        physics: [
            {
                title: '物理学院',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['/*path'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case '39060/list.htm':
                            type = '1';
                            break;
                        case '39070/list.htm':
                            type = '2';
                            break;
                        case '39079/list.htm':
                            type = '3';
                            break;
                        default:
                            type = '1';
                            break;
                    }
                    return `/zju/physics/${type}`;
                },
            },
        ],
        www: [
            {
                title: '普通栏目',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['/*path'],
                target: (params) => `/zju/list/${params.path.replace('/list.htm', '')}`,
            },
        ],
        'www.career': [
            {
                title: '就业服务平台',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['/'],
                target: '/zju/career/1',
            },
        ],
        'www.cst': [
            {
                title: '软件学院 - 全部通知',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['', '/*tpath'],
                target: '/zju/cst/0',
            },
            {
                title: '软件学院 - 招生信息',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/32178/list.htm',
                target: '/zju/cst/1',
            },
            {
                title: '软件学院 - 教务管理',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36216/list.htm',
                target: '/zju/cst/2',
            },
            {
                title: '软件学院 - 论文管理',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36217/list.htm',
                target: '/zju/cst/3',
            },
            {
                title: '软件学院 - 思政工作',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36192/list.htm',
                target: '/zju/cst/4',
            },
            {
                title: '软件学院 - 评奖评优',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36228/list.htm',
                target: '/zju/cst/5',
            },
            {
                title: '软件学院 - 实习就业',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36193/list.htm',
                target: '/zju/cst/6',
            },
            {
                title: '软件学院 - 国际实习',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36235/list.htm',
                target: '/zju/cst/7',
            },
            {
                title: '软件学院 - 国内合作科研',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36194/list.htm',
                target: '/zju/cst/8',
            },
            {
                title: '软件学院 - 国际合作科研',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36246/list.htm',
                target: '/zju/cst/9',
            },
        ],
        'www.grs': [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'qbgg/list.htm':
                            type = 1;
                            break;
                        case 'jxgl/list.htm':
                            type = 2;
                            break;
                        case 'glzz/list.htm':
                            type = 3;
                            break;
                        case 'xkjs/list.htm':
                            type = 4;
                            break;
                        case 'hwjl/list.htm':
                            type = 5;
                            break;
                        default:
                            type = 1;
                            break;
                    }
                    return `/zju/grs/${type}`;
                },
            },
        ],
    },
};
