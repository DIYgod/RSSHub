export default {
    'csu.edu.cn': {
        _name: '中南大学',
        career: [
            {
                title: '就业信息网招聘信息',
                docs: 'https://docs.rsshub.app/routes/university#zhong-nan-da-xue',
                source: ['/campus/index/category/1', '/campus', '/'],
                target: '/csu/career',
            },
        ],
        cse: [
            {
                title: '计算机学院',
                docs: 'https://docs.rsshub.app/routes/university#zhong-nan-da-xue',
                source: ['/index/:type'],
                target: (params) => `/csu/cse/${params.type.substring(0, 4)}`,
            },
        ],
        oa: [
            {
                title: '校长信箱',
                docs: 'https://docs.rsshub.app/routes/university#zhong-nan-da-xue',
                source: ['/mailbox/NoAuth/MailList_Pub'],
                target: (_, url) => `/csu/mail/${new URL(url).searchParams.get('tp')}`,
            },
        ],
    },
};
