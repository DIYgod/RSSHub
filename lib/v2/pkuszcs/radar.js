module.exports = {
    'ece.pku.edu.cn': {
        _name: '北深',
        xwzx: [
            {
                title: '信科公告通知',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-da-xue',
                source: ['/xwzx/:type'],
                target: (params) => {
                    let type = params.type;
                    switch (type) {
                        case 'xyxw.htm':
                            type = 1;
                            break;
                        case 'tzgg.htm':
                            type = 2;
                            break;
			default:
                            type = 0;
                            break;
                    }
                    return `/pku/xwzx/${type}`;
                },
            },
        ],
       
    },
};
