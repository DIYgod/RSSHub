export default {
    'sec.today': {
        _name: '每日安全',
        '.': [
            {
                title: '动态',
                docs: 'https://docs.rsshub.app/',
                source: ['/pulses', '/'],
                target: '/rsshub/transform/html/https%3A%2F%2Fsec.today%2Fpulses%2F/item=div[class="card-body"]',
            },
        ],
    },
};
