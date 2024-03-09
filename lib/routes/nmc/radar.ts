export default {
    'nmc.cn': {
        _name: '中央气象台',
        '.': [
            {
                title: '全国气象预警',
                docs: 'https://docs.rsshub.app/routes/forecast#zhong-yang-qi-xiang-tai',
                source: ['/publish/alarm.html', '/'],
                target: '/nmc/weatheralarm',
            },
        ],
    },
};
