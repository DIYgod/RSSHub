const { wh } = require('./data');

module.exports = {
    'sdu.edu.cn': {
        _name: '山东大学',
        'xinwen.wh': Object.entries(wh.news.columns).map(([, value]) => ({
            title: wh.news.titlePrefix + value.name,
            docs: wh.news.docs,
            source: wh.news.source,
            target: '/sdu/wh' + wh.news.getTarget(value.url),
        })),
        'www.cmse': [
            {
                title: '材料科学与工程学院通知',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'zxzx/tzgg.htm':
                            type = '0';
                            break;
                        case 'zxzx/xyxw.htm':
                            type = '1';
                            break;
                        case 'zxzx/bksjy.htm':
                            type = '2';
                            break;
                        case 'zxzx/yjsjy.htm':
                            type = '3';
                            break;
                        case 'zxzx/xsdt.htm':
                            type = '4';
                            break;
                        default:
                            type = '0';
                            break;
                    }
                    return `/sdu/cmse/${type}`;
                },
            },
        ],
        'www.cs': [
            {
                title: '计算机科学与技术学院通知',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'xygg.htm':
                            type = '0';
                            break;
                        case 'xsbg.htm':
                            type = '1';
                            break;
                        case 'kjjx.htm':
                            type = '2';
                            break;
                        default:
                            type = '0';
                            break;
                    }
                    return `/sdu/cs/${type}`;
                },
            },
        ],
        'www.epe': [
            {
                title: '能源与动力工程学院通知',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'zxzx/xydt.htm':
                            type = '0';
                            break;
                        case 'zxzx/tzgg.htm':
                            type = '1';
                            break;
                        case 'zxzx/xslt.htm':
                            type = '2';
                            break;
                        default:
                            type = '0';
                            break;
                    }
                    return `/sdu/epe/${type}`;
                },
            },
        ],
        'www.mech': [
            {
                title: '机械工程学院通知',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'xwdt/tzgg.htm':
                            type = '0';
                            break;
                        case 'xwdt/ysxw.htm':
                            type = '1';
                            break;
                        case 'xwdt/jxxx.htm':
                            type = '2';
                            break;
                        case 'xwdt/xsdt.htm':
                            type = '3';
                            break;
                        case 'xwdt/xyjb.htm':
                            type = '4';
                            break;
                        default:
                            type = '0';
                            break;
                    }
                    return `/sdu/mech/${type}`;
                },
            },
        ],
        'www.sc': [
            {
                title: '软件学院通知',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-da-xue',
                source: ['/*path', '/'],
                target: (params) => {
                    let type;
                    switch (params.path) {
                        case 'tzgg.htm':
                            type = '0';
                            break;
                        case 'kxyj/xsyg.htm':
                            type = '1';
                            break;
                        case 'rcpy/bkjy.htm':
                            type = '2';
                            break;
                        case 'rcpy/yjsjy.htm':
                            type = '3';
                            break;
                        default:
                            type = '0';
                            break;
                    }
                    return `/sdu/sc/${type}`;
                },
            },
        ],
    },
};
