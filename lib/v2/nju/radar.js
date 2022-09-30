module.exports = {
    'nju.edu.cn': {
        _name: '南京大学',
        admission: [
            {
                title: '本科迎新',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ben-ke-ying-xin',
                source: ['/tzgg/index.html', '/tzgg', '/'],
                target: '/nju/admission',
            },
        ],
        dafls: [
            {
                title: '大学外语部',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-da-xue-wai-yu-bu',
                source: ['/13167/list.html', '/'],
                target: '/nju/dafls',
            },
        ],
        elite: [
            {
                title: '本科生交换生系统',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ben-ke-sheng-yuan-jiao-huan-sheng-xi-tong',
                source: ['/exchangesystem/index/more', '/exchangesystem', '/'],
                target: (_, url) => `/nju/exchangesys/${new URL(url).searchParams.get('type') === 'xw' ? 'news' : 'proj'}`,
            },
        ],
        grawww: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-yan-jiu-sheng-yuan',
                source: ['/main.htm', '/'],
                target: '/nju/gra',
            },
        ],
        jjc: [
            {
                title: '基建处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ji-jian-chu',
                source: ['/main.htm', '/'],
                target: '/nju/jjc',
            },
        ],
        jw: [
            {
                title: '本科生院',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ben-ke-sheng-yuan',
                source: ['/:type/list.htm'],
                target: '/nju/jw/:type',
            },
        ],
        rczp: [
            {
                title: '人才招聘网',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ren-cai-zhao-pin-wang',
                source: ['/sylm/:type/index.html'],
                target: '/nju/rczp/:type',
            },
        ],
        scit: [
            {
                title: '科学技术处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-ke-xue-ji-shu-chu',
                source: ['/:type/list.htm'],
                target: (params) => `/nju/scit/${params.type === '11003' ? 'kydt' : 'tzgg'}`,
            },
        ],
        webplus: [
            {
                title: '后勤集团',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-hou-qin-ji-tuan',
                source: ['/_s25/main.psp'],
                target: '/nju/hqjt',
            },
        ],
        zbb: [
            {
                title: '招标办公室',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-zhao-biao-ban-gong-shi',
                source: ['/:type/index.chtml'],
                target: (params) => {
                    let type;
                    switch (params.type) {
                        case 'cgxxhw':
                        default:
                            type = 'cgxx';
                            break;
                        case 'cjgshw':
                            type = 'cjgs';
                            break;
                        case 'zfcgyxgk':
                            type = params.type;
                            break;
                    }
                    return `/nju/zbb/${type}`;
                },
            },
        ],
        zcc: [
            {
                title: '资产管理处',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-da-xue-zi-chan-guan-li-chu',
                source: ['/tzgg/gyfytdglk/index.html', '/tzgg/index.html', '/'],
                target: '/nju/zcc',
            },
        ],
    },
};
