module.exports = {
    'csu.edu.cn': {
        _name: '中南大学',
        cse: [
            {
                title: '计算机学院',
                docs: 'https://docs.rsshub.app/university.html#zhong-nan-da-xue',
                source: ['/index/:type'],
                target: (params) => `/csu/cse/${params.type.substring(0, 4)}`,
            },
        ],
        oa: [
            {
                title: '校长信箱',
                docs: 'https://docs.rsshub.app/university.html#zhong-nan-da-xue',
                source: ['/WebServer/MailBoxNew/MailList_Pub.aspx?tp=:type'],
                target: (params) => `/csu/mail/${params.type}`,
            },
        ],
    },
};
