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
                title: '软件学院',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['/*path'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case '32178/list.htm':
                            type = '1';
                            break;
                        case '36216/list.htm':
                            type = '2';
                            break;
                        case '36217/list.htm':
                            type = '3';
                            break;
                        case '36224/list.htm':
                            type = '4';
                            break;
                        case '36228/list.htm':
                            type = '5';
                            break;
                        case '36233/list.htm':
                            type = '6';
                            break;
                        case '36235/list.htm':
                            type = '7';
                            break;
                        case '36194/list.htm':
                            type = '8';
                            break;
                        case '36246/list.htm':
                            type = '9';
                            break;
                        case '36195/list.htm':
                            type = '10';
                            break;
                        default:
                            type = '0';
                    }
                    return `/zju/cst/${type}`;
                },
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
                        case '1335/list.htm':
                            type = 1;
                            break;
                        case '1336/list.htm':
                            type = 2;
                            break;
                        case '1337/list.htm':
                            type = 3;
                            break;
                        case '1338/list.htm':
                            type = 4;
                            break;
                        case '1339/list.htm':
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
