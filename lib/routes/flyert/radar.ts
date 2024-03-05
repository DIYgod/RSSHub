export default {
    'flyert.com': {
        _name: '飞客茶馆',
        '.': [
            {
                title: '优惠信息',
                docs: 'https://docs.rsshub.app/routes/travel#fei-ke-cha-guan-you-hui-xin-xi',
                source: '/',
                target: '/flyert/preferential',
            },
            {
                title: '信用卡',
                docs: 'https://docs.rsshub.app/routes/travel#fei-ke-cha-guan-xin-yong-ka',
                source: '/',
                target: '/flyert/creditcard/:bank',
            },
        ],
    },
};
