export default {
    'hit.edu.cn': {
        _name: '哈尔滨工业大学',
        jwc: [
            {
                title: '哈尔滨工业大学教务处通知公告',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-ye-da-xue',
                source: '/*',
                target: '/hit/jwc',
            },
        ],
        today: [
            {
                title: '今日哈工大',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-ye-da-xue',
                source: '/category/:category',
                target: '/hit/today/:category',
            },
        ],
        hitgs: [
            {
                title: '哈工大研究生院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-ye-da-xue',
                source: '/*',
                target: '/hit/hitgs',
            },
        ],
    },
};
