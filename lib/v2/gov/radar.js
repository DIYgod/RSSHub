module.exports = {
    'tqyb.com.cn': {
        _name: '广州天气',
        www: [
            {
                title: '突发性天气提示',
                docs: 'https://docs.rsshub.app/government.html#guang-zhou-tian-qi-tu-fa-xing-tian-qi-ti-shi',
                source: ['/gz/weatherAlarm/suddenWeather/'],
                target: '/gov/guangdong/tqyb/tfxtq',
            },
            {
                title: '广东省内城市预警信号',
                docs: 'https://docs.rsshub.app/government.html#guang-zhou-tian-qi-guang-dong-sheng-nei-cheng-shi-yu-jing-xin-hao',
                source: ['/gz/weatherAlarm/otherCity/'],
                target: '/gov/guangdong/tqyb/sncsyjxh',
            },
        ],
    },
};
