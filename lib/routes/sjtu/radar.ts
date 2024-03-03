export default {
    'sjtu.edu.cn': {
        _name: '上海交通大学',
        'bjwb.seiee': [
            {
                title: '电子信息与电气工程学院',
                docs: 'https://docs.rsshub.app/routes/university#shang-hai-jiao-tong-da-xue',
                source: ['/seiee/list/:type', '/bkjwb/list/:type', '/xsb/list/:type'],
                target: (params) => {
                    let type = '';
                    switch (params.type) {
                        // /sjtu/seiee/academic
                        case '683-1-20.htm':
                            type = 'academic';
                            break;
                        // /sjtu/seiee/bjwb/:type
                        case '1503-1-20.htm':
                            type = 'bjwb/academic';
                            break;
                        case '1505-1-20.htm':
                            type = 'bjwb/academic';
                            break;
                        case '1506-1-20.htm':
                            type = 'bjwb/postgraduate';
                            break;
                        case '1507-1-20.htm':
                            type = 'bjwb/abroad';
                            break;
                        case '2281-1-20.htm':
                            type = 'bjwb/international';
                            break;
                        // /sjtu/seiee/xsb/:type?
                        case '2938-1-20.htm':
                            type = 'xsb/news';
                            break;
                        case '611-1-20.htm':
                            type = 'xsb/scholarship';
                            break;
                        case '2676-1-20.htm':
                            type = 'xsb/activity';
                            break;
                        case '1981-1-20.htm':
                            type = 'xsb/lecture';
                            break;
                        case '705-1-20.htm':
                            type = 'xsb/all';
                            break;
                        case '1001-1-20.htm':
                            type = 'xsb/financialAid';
                            break;
                        case '3016-1-20.htm':
                            type = 'xsb/zhcp';
                            break;
                        default:
                            return null;
                    }
                    return `/sjtu/seiee/${type}`;
                },
            },
        ],
        gs: [
            {
                title: '研究生通知公告',
                docs: 'https://docs.rsshub.app/routes/university#shang-hai-jiao-tong-da-xue-yan-jiu-sheng-tong-zhi-gong-gao',
                source: ['/announcement/:type'],
                target: '/sjtu/gs/:type',
            },
        ],
        jwc: [
            {
                title: '教务处通知公告',
                docs: 'https://docs.rsshub.app/routes/university#shang-hai-jiao-tong-da-xue',
                source: ['/xwtg/:type'],
                target: (params) => {
                    let type = '';
                    switch (params.type) {
                        case 'xwzx.htm':
                            type = 'news';
                            break;
                        case 'tztg.htm':
                        case '':
                            type = 'notice';
                            break;
                        case 'jxyx.htm':
                            type = 'operation';
                            break;
                        case 'zcxw.htm':
                            type = 'affairs';
                            break;
                        case 'yjb.htm':
                            type = 'yjb';
                            break;
                        case 'jgb.htm':
                            type = 'jgb';
                            break;
                        case 'zhb.htm':
                            type = 'zhb';
                            break;
                        case 'yywz.htm':
                            type = 'language';
                            break;
                        case 'ghyzb.htm':
                            type = 'party';
                            break;
                        case 'tsjy.htm':
                            type = 'ge';
                            break;
                        default:
                            type = 'notice';
                            break;
                    }
                    return `/sjtu/jwc/${type}`;
                },
            },
        ],
        tongqu: [{ title: '同去网最新活动', docs: 'https://docs.rsshub.app/routes/university#shang-hai-jiao-tong-da-xue' }],
        yzb: [
            {
                title: '研究生招生网招考信息',
                docs: 'https://docs.rsshub.app/routes/university#shang-hai-jiao-tong-da-xue',
                source: ['/index/zkxx/:type'],
                target: (params) => `/sjtu/yzb/zkxx/${params.type.replace('.htm', '')}`,
            },
        ],
    },
};
