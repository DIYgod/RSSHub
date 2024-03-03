export default {
    'ucas.ac.cn': {
        _name: '中国科学院大学',
        ai: [
            {
                title: '人工智能学院',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-ke-xue-yuan-da-xue',
                source: ['/index.php/zh-cn/tzgg', '/'],
                target: '/ucas/ai',
            },
        ],
        zhaopin: [
            {
                title: '招聘信息',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-ke-xue-yuan-da-xue',
                source: ['/gjob/login.do', '/'],
                target: (_, url) => {
                    const c = new URL(url).searchParams.get('c');
                    let type = '';
                    switch (c) {
                        case '3':
                            type = 'jxkyrc';
                            break;
                        case '4':
                            type = 'glzcrc';
                            break;
                        case '5':
                            type = 'ktxmpy';
                            break;
                        case '6':
                            type = 'bsh';
                            break;
                        default:
                            break;
                    }
                    return `/ucas/job${type ? `/${type}` : ''}`;
                },
            },
        ],
    },
};
